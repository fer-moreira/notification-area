
const { GObject, St, Gio } = imports.gi;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();



const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('My Shiny Indicator'));

        let box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });

        let icon = new St.Icon({
            style_class: 'system-status-icon'
        });
        icon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/notification-indicator.svg`);

        box.add_child(icon);
        this.add_child(box);
    }
});
