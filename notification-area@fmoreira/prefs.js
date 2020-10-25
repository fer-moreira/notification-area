const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Gettext = imports.gettext.domain("notification-area");
const _ = Gettext.gettext;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Lang = imports.lang;

const Extension = imports.misc.extensionUtils.getCurrentExtension();

function init() {
    // Convenience.initTranslations("notification-area");
}

const Page = new GObject.Class({
    Name: "Page",
    GTypeName: "Page",
    Extends: Gtk.Box,

    _init: function (title) {
        this.parent({
            orientation: Gtk.Orientation.VERTICAL,
            margin: 24,
            spacing: 20,
            homogeneous: false
        });
        this.title = new Gtk.Label({
            label: "<b>" + title + "</b>",
            use_markup: true,
            xalign: 0,
            justify: Gtk.Justification.CENTER
        });
    },

    _scaleHandlerBox: function (data) {
        let _container = new Gtk.Box({
            baseline_position: Gtk.BaselinePosition.CENTER,
            homogeneous: false,
            spacing: 0,
            orientation: Gtk.Orientation.HORIZONTAL,
        });

        let label = new Gtk.Label({
            label: data.title,
            use_markup: false,
            xalign: 0
        });

        let scale = new Gtk.Scale({
            round_digits: 1,
            digits: 0,
            value_pos: Gtk.PositionType.RIGHT,
            show_fill_level: true,
            can_focus: true,
            visible: true,
            name: data.name,
            adjustment: new Gtk.Adjustment({
                lower: data.lower,
                upper: data.upper,
                step_increment: 1,
                page_increment: 1,
                page_size: 0
            }),
            hexpand: true
        });

        scale.connect("format-value", (scale, value) => {
            return value.toString() + " " + data.format_txt;
        });

        scale.add_mark(data.default, Gtk.PositionType.BOTTOM, data.default.toString());
        scale.set_value(this.settings.get_int(data.key_name));
        scale.connect("value-changed", Lang.bind(this, function () {
            this.settings.set_int(data.key_name, scale.get_value());
        }));

        _container.add(label);
        _container.add(scale);

        return _container;
    }
});

const PrefsWidget = new GObject.Class({
    Name: "Prefs.Widget",
    GTypeName: "PrefsWidget",
    Extends: Gtk.Box,

    _init: function () {
        this.parent({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 5,
            border_width: 5
        });
        this.settings = Convenience.getSettings();

        let notebook = new Gtk.Notebook({
            margin_left: 6,
            margin_right: 6,
            tab_pos: Gtk.PositionType.LEFT
        });

        _settingsPage = new SettingsPage(this.settings);
        notebook.append_page(_settingsPage, _settingsPage.title);

        _prototypePage = new PrototypePage(this.settings);
        notebook.append_page(_prototypePage, _prototypePage.title);

        _aboutPage = new AboutPage(this.settings);
        notebook.append_page(_aboutPage, _aboutPage.title);

        this.add(notebook);
    }
});

var SettingsPage = new Lang.Class({
    Name: "SettingsPage",
    Extends: Page,

    _init: function (settings) {
        this.parent(_("Settings"));
        this.settings = settings;

        let _main_box = new Gtk.Box({
            baseline_position: Gtk.BaselinePosition.TOP,
            homogeneous: false,
            spacing: 0,
            orientation: Gtk.Orientation.VERTICAL,
            expand: true
        });

        _main_box.add(this._scaleHandlerBox({
            title: "Area Width:", 
            name: "notification_area_width",
            lower: 300,
            upper: 900,
            default: 400,
            format_txt: "px",
            key_name: "notification-area-width"
        }));

        _main_box.add(this._scaleHandlerBox({
            title: "Hide Duration:", 
            name: "hide_duration",
            lower: 50,
            upper: 600,
            default: 200,
            format_txt: "ms",
            key_name: "hide-duration"
        }));

        _main_box.add(this._scaleHandlerBox({
            title: "Banner Height:", 
            name: "notification_box_height",
            lower: 50,
            upper: 300,
            default: 100,
            format_txt: "px",
            key_name: "notification-box-height"
        }));

        this.add(_main_box);
    }
});

var PrototypePage = new Lang.Class({
    Name: "PrototypePage",
    Extends: Page,

    _init: function (settings) {
        this.parent(_("Prototypes"));
        this.settings = settings;
    }
})

var AboutPage = new Lang.Class({
    Name: "AboutPage",
    Extends: Page,

    _init: function (settings) {
        this.parent(_("About"));
        this.settings = settings;

        let releaseVersion = Me.metadata["version"];
        let projectName = Me.metadata["name"];
        let projectDescription = Me.metadata["description"];
        let projectUrl = Me.metadata["url"];
        let logoPath = Me.path + "/media/logo.svg";
        let [imageWidth, imageHeight] = [128, 128];
        let pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(logoPath, imageWidth, imageHeight);
        let menuImage = new Gtk.Image({
            pixbuf: pixbuf
        });
        let menuImageBox = new Gtk.VBox({
            margin_top: 5,
            margin_bottom: 5,
            expand: false
        });
        menuImageBox.add(menuImage);

        // Create the info box
        let menuInfoBox = new Gtk.VBox({
            margin_top: 5,
            margin_bottom: 5,
            expand: false
        });
        let menuLabel = new Gtk.Label({
            label: "<b>" + projectName + "</b>",
            use_markup: true,
            expand: false
        });
        let versionLabel = new Gtk.Label({
            label: "<b>" + _("Version: ") + releaseVersion + "</b>",
            use_markup: true,
            expand: false
        });
        let projectDescriptionLabel = new Gtk.Label({
            label: "\n" + _(projectDescription),
            expand: false,
            justify: Gtk.Justification.CENTER
        });
        let helpLabel = new Gtk.Label({
            label: "\n" + _("If something breaks, don\'t hesitate to leave a comment at "),
            expand: false
        });
        let projectLinkButton = new Gtk.LinkButton({
            label: _("Webpage/Github"),
            uri: projectUrl,
            expand: false
        });
        menuInfoBox.add(menuLabel);
        menuInfoBox.add(versionLabel);
        menuInfoBox.add(projectDescriptionLabel);
        menuInfoBox.add(helpLabel);
        menuInfoBox.add(projectLinkButton);

        let authorLabel = new Gtk.Label({
            label: _("Notification Area made by fmoreira"),
            justify: Gtk.Justification.CENTER,
            expand: true
        });

        // Create the GNU software box
        let gnuSofwareLabel = new Gtk.Label({
            label: '<span size="small">This program comes with ABSOLUTELY NO WARRANTY.\n' +
                'See the <a href="http://www.gnu.org/licenses/gpl-3.0.html">GNU General Public License version 3</a> for details.</span>',
            use_markup: true,
            justify: Gtk.Justification.CENTER,
            expand: true
        });
        let gnuSofwareLabelBox = new Gtk.VBox({});
        gnuSofwareLabelBox.pack_end(gnuSofwareLabel, false, false, 0);

        this.add(menuImageBox);
        this.add(menuInfoBox);
        this.add(authorLabel);
        this.add(gnuSofwareLabelBox);
    }
});



function buildPrefsWidget() {
    let widget = new PrefsWidget();
    widget.show_all();
    return widget;
}