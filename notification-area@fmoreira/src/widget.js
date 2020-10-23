const St = imports.gi.St;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;
const GLib = imports.gi.GLib;
const Shell = imports.gi.Shell;
const Me = imports.misc.extensionUtils.getCurrentExtension();

var NotificationBox = GObject.registerClass({},
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

            
            this.payload.hasApp && widget.add_actor(this._iconContainer());

            super._init({
                child: widget,
                style_class: "notification-box",
                height: this.boxHeight,
                width: width,
                reactive: true,
                can_focus: true,
                track_hover: true
            });
        }

        _iconContainer () {
            let _bin = new St.Bin({
                style_class : "notification-icon-container",
                can_focus : false,
                track_hover : false,
                reactive: false,
                height : this.boxHeight,
                width: this._value_percentage(this.boxWidth, 25)
            });

            _bin.add_actor(this.payload.iconObj);

            return _bin;
        }

        _descriptionContainer () {
            let container = new St.Bin({
                style_class : "notification-description-container",
                can_focus : false,
                track_hover : false,
                reactive: false,
                height : this.boxHeight,
                width: this._value_percentage(this.boxWidth, 60)
            });

            return container;
        }

        _closeContainer () {
            let container = new St.Bin({
                style_class : "notification-buttons-container",
                can_focus : false,
                track_hover : false,
                reactive: false,
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

        _openApp (app) {
            Shell.AppSystem.get_default().lookup_app(app).activate();
        }
    }
);

const getMethods = (obj) => {
    let properties = new Set()
    let currentObj = obj
    do {
      Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof obj[item] === 'function')
  }

var NotificationsWidget = GObject.registerClass({},
class NotificationsWidget extends St.Widget {
    _init (width, height) {
        this.boxWidth = width;
        this.boxHeight = height;

        this.notificationsMap = new Map();
        this._tempBoxData = {};


        this._initWidget();
        this._setListeners();
    }

    _initWidget () {
        this._rtl = (Clutter.get_default_text_direction() == Clutter.TextDirection.RTL);

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

    // Function logic
    // if some push notification is added to tray
    // catch, create a payload, add the box to widget
    // else
    // remove the  box from widget usind its pid
    _setListeners () {
        Main.messageTray.connect('source-added', (t, source) => {

            log("DEBUG:");
            log(source.notifications.length);

            try {
                this._tempBoxData.source = source;
                this._tempBoxData.pid = source.pid;
                this._tempBoxData.title = source.title;
                this._tempBoxData.hasApp = (source.app != null) ? true : false;
                this._tempBoxData.iconObj = source.createIcon(source.SOURCE_ICON_SIZE);
                
                if (source.app) {
                    this._tempBoxData.app = source.app;
                    this._tempBoxData.app_id = source.app.id;
                } else {
                    log(getMethods(source));
                }

            } catch (error) {
                log("Error creating boxData: " + error);
            }

            try {
                let box = new NotificationBox(this.boxWidth, this.boxHeight, this._tempBoxData);
                this.notificationsMap.set(source.pid, box);
                this.add_actor(box);
            } catch (error) {
                log("Error creating and adding NotificationBox in '" + this + "' reason: " + error);                
            }

        });

        Main.messageTray.connect('source-removed', (t, source) => {
            try {
                this.notificationsMap.has(source.pid) && this.remove_actor(this.notificationsMap.get(source.pid));

                // HACK 
                // if the message tray is empty and have notification in area
                if (t.getSources().length == 0) this.destroy_all_children();

            } catch (error) {
                log("Error removing the notification from widget: " + error);                
            }
        });
    }
});

