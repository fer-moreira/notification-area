const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gdk = imports.gi.Gdk;

const Me = imports.misc.extensionUtils.getCurrentExtension()
const ExtensionUtils = imports.misc.extensionUtils;



var SettingsPrefsWidget = class SettingsPrefsWidget {
    constructor () {
        this._settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.notification-area');

        this._builder = new Gtk.Builder();
        // this._builder.set_translation_domain(Me.metadata['gettext-domain']);
        this._builder.add_from_file(Me.path + '/settings.ui');

        this.widget = new Gtk.ScrolledWindow({ hscrollbar_policy: Gtk.PolicyType.NEVER });
        this._notebook = this._builder.get_object('settings_notebook');
        this.widget.add(this._notebook);

        // Set a reasonable initial window height
        this.widget.connect('realize', () => {
            let window = this.widget.get_toplevel();
            let [default_width, default_height] = window.get_default_size();
            window.resize(default_width, 450);
        });

        this._notification_area_width_timeout   = 0;
        this._hide_duration_timeout             = 0;
        this._notification_box_height_timeout   = 0;

        this._bindSettings();
        this._builder.connect_signals_full(this._connector.bind(this));
    }

    _connector(builder, object, signal, handler) {
        const SignalHandler = {

            // SCALE CHANGES
            width_scale_value_changed_cb (scale) {
                log(scale);

                if (this._notification_area_width_timeout > 0)
                    GLib.source_remove(this._notification_area_width_timeout);

                this._notification_area_width_timeout = GLib.timeout_add(
                    GLib.PRIORITY_DEFAULT, SCALE_UPDATE_TIMEOUT, () => {
                    this._settings.set_int('notification-area-width', scale.get_value());
                    this._notification_area_width_timeout = 0;
                    return GLib.SOURCE_REMOVE;
                });
            },
            duration_scale_value_changed_cb (scale) {
                if (this._hide_duration_timeout > 0)
                    GLib.source_remove(this._hide_duration_timeout);

                this._hide_duration_timeout = GLib.timeout_add(
                    GLib.PRIORITY_DEFAULT, SCALE_UPDATE_TIMEOUT, () => {
                    this._settings.set_int('hide-duration', scale.get_value());
                    this._hide_duration_timeout = 0;
                    return GLib.SOURCE_REMOVE;
                });
            },
            box_height_scale_value_changed_cb (scale) {

                if (this._notification_box_height_timeout > 0)
                    GLib.source_remove(this._notification_box_height_timeout);

                this._notification_box_height_timeout = GLib.timeout_add(
                    GLib.PRIORITY_DEFAULT, SCALE_UPDATE_TIMEOUT, () => {
                    this._settings.set_int('notification-box-height', scale.get_value());
                    this._notification_box_height_timeout = 0;
                    return GLib.SOURCE_REMOVE;
                });
            },

            // FORMAT
            width_scale_value_format (scale, value) {
                return value + ' px';
            },
            duration_scale_value_format (scale, value) {
                return value + ' ms';
            },
            box_height_scale_value_format (scale, value) {
                return value + ' px';
            },
        };

        object.connect(signal, SignalHandler[handler].bind(this));
    }

    _bindSettings () {
        this._builder.get_object('width_scale').set_value(this._settings.get_int('notification-area-width'));
        this._builder.get_object('duration_scale').set_value(this._settings.get_int('hide-duration'));
        this._builder.get_object('box_height_scale').set_value(this._settings.get_int('notification-box-height'));
    }
}

function init() {
    ExtensionUtils.initTranslations();
}

function buildPrefsWidget () {
  let settings = new SettingsPrefsWidget();
  let widget = settings.widget;
  widget.show_all();
  return widget;
}