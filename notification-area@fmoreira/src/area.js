
const { GObject, St, Gio, Clutter } = imports.gi;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();



const NotificationArea = GObject.registerClass({
    Signals: {
        'showing': {},
        'hiding': {},
    }
},
class NotificationArea extends St.Bin {
    _init() {
        this.pMonitor       = Main.layoutManager.primaryMonitor;
        this.mainPanel      = Main.panel;
        this.panelHeight    = this.mainPanel.height;
        
        this._ISSHOWING     = false;
        this._EASEDURATION  = 500;
        this._WIDTH         = 400;
        this._HEIGHT        = this.pMonitor.height - this.panelHeight;
        this._X             = this.pMonitor.width + this._WIDTH;
        this._Y             = this.panelHeight;

        super._init(this._calculateSize());
        this._delegate = this;
        this._initNotifications();
    }

    _calculateSize () {
        return {
            style       : 'background-color : rgba(0,0,0,0.5)',
            reactive    : true,
            can_focus   : true,
            track_hover : true,
            width       : this._WIDTH,
            height      : this._HEIGHT,
            x           : this._X,
            y           : this._Y,
        };
    }

    _ToggleNotificationArea () {
        this.isShowing = !this.isShowing;
        this.isShowing ? this._showNotificationArea() : this._hideNotificationArea();
    }

    _showNotificationArea () {
        this.emit("showing");

        let showX = this.pMonitor.width - this._WIDTH;
        this.ease({
            x: showX,
            duration: this._EASEDURATION,
            mode: Clutter.AnimationMode.EASE_OUT_QUINT,
        });
    }

    _hideNotificationArea () {
        this.emit("hiding");

        let hideX = this.pMonitor.width;
        this.ease({
            x: hideX,
            duration: this._EASEDURATION,
            mode: Clutter.AnimationMode.EASE_OUT_QUINT,
        });
    }

    _initNotifications () {
        this._bindTray();
    }

    _bindTray () {
        // Main.messageTray.connect("source-added" , (t,s) => { this._refreshPseudoClass(t); });
    }
});


const Notification = GObject.registerClass({},
class Notification extends St.Bin {
    _init() {
        this.layout = new Clutter.GridLayout({
            orientation: Clutter.Orientation.HORIZONTAL
        });

        this.widget = new St.Widget({
            name: "area__widget",
            layout_manager: this.layout
        });

        super._init(this._initArea());
    }

    _initArea () {
        return {
            child: null,
            style_class: "notification-box",
            height: 100,
            width: 400,
            reactive: true,
            can_focus: true,
            track_hover: true
        }
    }
});