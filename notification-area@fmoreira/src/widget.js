const { St, Gio } = imports.gi;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;
const Me = imports.misc.extensionUtils.getCurrentExtension();

var NotificationBox = GObject.registerClass({
    Signals: {
        'banner_click': {},
    }
},
    class NotificationBox extends St.Bin {
        _init (width, height, data) {
            this.boxWidth = width;
            this.boxHeight = height;
            this.payload = data;
           
            let layout = new Clutter.GridLayout({
                orientation: Clutter.Orientation.HORIZONTAL
            });

            let widget = new St.Widget({
                name: "notification_box__widget",
                layout_manager: layout
            });

            widget.add_actor(this._iconContainer());
            widget.add_actor(this._descriptionContainer());
            widget.add_actor(this._closeContainer());

            super._init({
                child: widget,
                style_class: "notification-box",
                height: this.boxHeight,
                width: width,
                reactive: true,
                can_focus: true,
                track_hover: true
            });

            this.connect("button-press-event", () => {
                this.payload.hasApp ? this.payload.app.object.activate() : this.payload.origin.destroy();
            });
        }

        _iconContainer () {
            let _bin = new St.Bin({
                style_class : "notification_box__icon",
                can_focus : false,
                track_hover : false,
                reactive: false,
                height : this.boxHeight,
                width: this._value_percentage(this.boxWidth, 25)
            });
            
            
            if (this.payload.hasApp) {
                _bin.add_actor(this.payload.icon);
            } else {
                let nullIcon = new St.Icon({
                    icon_name: "dialog-information-symbolic",
                    style_class : "notification_box__icon--icon"
                });
                _bin.add_actor(nullIcon);
            }

            return _bin;
        }

        _descriptionContainer () {
            let layout = new Clutter.GridLayout({
                orientation: Clutter.Orientation.VERTICAL
            });

            let widget = new St.Widget({
                name: "notification_box__widget",
                layout_manager: layout
            });

            let default_color = new Clutter.Color({red:255, green: 255, blue: 255,alpha: 255});

            let _desc = new Clutter.Text({
                text: this.payload.content.description.replace("\n"," "),
                line_wrap: true,
                color: default_color,
                use_markup: this.payload.content.isMarkup,
                ellipsize: 3
            });


            widget.add_actor(new St.Label({
                style_class: "notification_box__label--title",
                text: this.payload.content.title
            }));
            widget.add_actor(_desc);
            

            let container = new St.Bin({
                child: widget,
                style_class : "notification_box__content",
                can_focus : false,
                track_hover : false,
                reactive: false,
                height : this.boxHeight,
                width: this._value_percentage(this.boxWidth, 60)
            });

            return container;
        }

        _closeContainer () {
            let layout = new Clutter.BinLayout({
                x_align: Clutter.BinAlignment.CENTER,
                y_align: Clutter.BinAlignment.START
            });

            let widget = new St.Widget({
                name: "notification_box__widget",
                layout_manager: layout
            });


            let _icon = new St.Icon({
                style_class: "notification-button--icon",
                gicon: Gio.icon_new_for_string(`${Me.path}/icons/close-symbolic.svg`)
            });

            let _button = new St.Button({style_class : "notification-button"});
            
            
            _button.add_actor(_icon);
            
            _button.connect("clicked", () => {
                this.payload.origin.destroy();
                // this.destroy();
            });

            
            widget.add_actor(_button);
            let container = new St.Bin({
                style_class : "notification-buttons-container",
                child: widget,
                reactive: true,
                can_focus : true,
                track_hover : true,
                height : this.boxHeight,
                width: this._value_percentage(this.boxWidth, 10)
            });
            
            return container;
        }

        _value_percentage (val, percentage) {
            try {
                return (percentage * val) / 100.0;
            } catch {
                printerr("Percentage calculation error");
                return 80;
            }
            
        }
    }
);


var NotificationsWidget = GObject.registerClass({},
class NotificationsWidget extends St.Widget {
    _init (width, height) {
        this.boxWidth = width;
        this.boxHeight = height;

        this.notificationsMap = new Map();

        this._initWidget();
        this._setListeners();
    }

    _initWidget () {
        let layout = new Clutter.BoxLayout({
            orientation: Clutter.Orientation.VERTICAL
        });

        super._init({
            name: 'notification__widget',
            layout_manager: layout,
            clip_to_allocation: true,
            y_align: Clutter.ActorAlign.START
        });
        
        this.set_offscreen_redirect(Clutter.OffscreenRedirect.ALWAYS);
    }

    _setListeners () {
        Main.messageTray.connect('source-added', (t, source) => {
            source.connect("notification-added", (postSource) => {

                try {
                    let _nlength = postSource.notifications.length-1;
                    let _source = postSource.notifications[_nlength];

                    let payload = {
                        origin: source,
                        pid: source.pid,
                        icon: source.createIcon(source.SOURCE_ICON_SIZE),
                        content: {
                            title:       _source.title,
                            description: _source.bannerBodyText,
                            isMarkup:    _source.bannerBodyMarkup,
                            datetime:    _source.datetime.format_iso8601(),
                        },
                        hasApp: (source.app != null) ? true : false
                    }

                    if (source.app) {
                        payload.app = {
                            title: source.app.title,
                            object: source.app
                        }
                    }
                    if (this.notificationsMap.has(source)) {
                        this.remove_actor(this.notificationsMap.get(source));
                        this.notificationsMap.delete(source);
                    }

                    let box = new NotificationBox(this.boxWidth, this.boxHeight, payload);
                    this.notificationsMap.set(source, box);
                    this.add_actor(box);

                } catch (error) {
                    log("Error adding notification box to area, \nreason: "+error);
                }
            });
        });

        Main.messageTray.connect('source-removed', (t, source) => {
            try {
                if (this.notificationsMap.has(source)) {
                    this.remove_actor(this.notificationsMap.get(source));
                    this.notificationsMap.delete(source);
                }
            } catch (error) {
                log("Error removing the notification from widget: " + error);                
            }
        });
    }
});