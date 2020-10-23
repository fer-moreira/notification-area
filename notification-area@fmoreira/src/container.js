const St = imports.gi.St;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const GObject = imports.gi.GObject;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const settings = Me.imports.convenience.settings;


const Widgets = Me.imports.src.widget;

var NotificationArea = GObject.registerClass({
    Signals: {
        'showing': {},
        'hiding': {},
    }
}, class NotificationArea extends St.Bin {
    _init () {
        this._buildContainer();
    }

    _buildContainer () {
        // SETTINGS
        let monitor       = Main.layoutManager.primaryMonitor;
        this.mHeight      = monitor.height;
        this.mWidth       = monitor.width;
        this.hOffset      = Main.panel.height;
        this.wSize        = settings.get_int("notification-area-width");
        this.hideDuration = settings.get_int("hide-duration");
        this.hBoxSize     = settings.get_int("notification-box-height");
        this.isOpen = false;

        this._initArea ();

        this._bindSettingsChange();

        Main.messageTray.connect("source-added" , (t,s) => {
            this._refreshPseudoClass(t);
        });

        Main.messageTray.connect("source-removed" , (t,s) => {
            this._refreshPseudoClass(t);
        });

        // CREATE A CONNECTION WHEN DISABLE WILL DESTROY THIS OBJECT
        this.connect("destroy", () => {
            this._onDestroy();
        });
    }

    _initArea  () {
        // CHILDS
        this._widget = new Widgets.NotificationsWidget(this.wSize, this.hBoxSize);
        
        // INIT BIN NOTIFICATION AREA
        super._init({
            child: this._widget,
            style_class : 'notification-container',
            reactive: true,
            can_focus : true,
            track_hover : true,
            height: this.mHeight - this.hOffset,
            width : this.wSize,
        });

        //SET DEFAULT POSITION TO THE RIGHT
        this.set_position(this.mWidth, this.hOffset);

        // ADD BIN TO GNOME DESKTOP
        Main.layoutManager.addChrome(this, {
            affectsInputRegion: true,
            affectsStruts : false,
            trackFullscreen: false
        });
    }

    _bindSettingsChange () {
        // this._settings,
        //     'changed::multi-monitor',
        //     this._toggle.bind(this)

        settings.connect("changed::notification-area-width", () => {
            log("mudou o width porra");
        });
    }

    _onDestroy () {
        // REMOVE BIN FROM GNOME DESKTOP FIRST THEN DISABLE
        Main.layoutManager.removeChrome(this);
    }
    
    _refreshPseudoClass (tray) {
        this.set_style_pseudo_class((tray.getSources().length > 0) ? "has_notif" : "empty_notif");
    }

    // SIMPLE TOGGLE FUNCTION TO SHOW AND HIDE NOTIFICATION BIN
    _toggleNotificationArea () {
        this.isOpen = !this.isOpen;
        (this.isOpen) ? this._showNotificationArea() : this._hideNotificationArea();
    }

    _showNotificationArea () {
        this.emit("showing");

        let showX = this.mWidth - this.wSize;
        this.ease({
            x: showX,
            duration: this.hideDuration,
            mode: Clutter.AnimationMode.EASE,
        });
    }

    _hideNotificationArea () {
        this.emit("hiding");

        let hideX = this.mWidth;
        this.ease({
            x: hideX,
            duration: this.hideDuration,
            mode: Clutter.AnimationMode.EASE,
        });
    }

});
