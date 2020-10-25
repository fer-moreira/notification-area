const { St, Gio } = imports.gi;
const GObject = imports.gi.GObject;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();


var NotificationIndicator = GObject.registerClass({
    Signals: {
        'showing': {},
        'hiding': {},
    }
}, class NotificationIndicator extends PanelMenu.Button {
    _init () {
        super._init(0);

        this.notif_empty = Gio.icon_new_for_string(`${Me.path}/icons/notification-empty-symbolic.svg`);
        this.notif_solid = Gio.icon_new_for_string(`${Me.path}/icons/notification-solid-symbolic.svg`);
        this.notif_turnoff = Gio.icon_new_for_string(`${Me.path}/icons/notification-off-symbolic.svg`);

        this.box = new St.BoxLayout({
            vertical: false,
            style_class: "notification-indicator-box"
        });

        this.icon = new St.Icon({
            style_class : "system-status-icon",
            gicon : this.notif_empty
        });
        
        this.label = new St.Label({
            visible: false,
            x_align: Clutter.ActorAlign.END,
            y_align: Clutter.ActorAlign.START,
            style_class: "notes-icon-indicator"
        });

        Main.messageTray.connect("source-added", (t, s) => { this._refreshLabelIcon(t) });
        Main.messageTray.connect("source-removed", (t, s) => { this._refreshLabelIcon(t) });
        
        this.box.add_actor(this.icon);
        this.box.add_actor(this.label);
        
        this.add_child(this.box);

        Main.panel.addToStatusArea('Notification Indicator', this, 999);

        this.connect("destroy", () => { this._onDestroy(); });
    }

    _onDestroy () {
        Main.panel.remove_child(this);
        Main.messageTray.disconnect(this);
    }

    _refreshLabelIcon (t) {
        if (t.getSources().length == 0) {
            this.label.set_text("");
            this.label.hide();
            this.icon.gicon = this.notif_empty;
        } else {
            this.icon.gicon = this.notif_solid;
            this.label.set_text((t.getSources().length).toString());
            this.label.show();
        }
    }
});
