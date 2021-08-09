const GETTEXT_DOMAIN = 'my-indicator-extension';
const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const Main = imports.ui.main;

const ExtensionUtils = imports.misc.extensionUtils;
const Config = imports.misc.config;
const Me = ExtensionUtils.getCurrentExtension();

const NotificationIndicator = Me.imports.src.indicator.Indicator;
const NotificationArea = Me.imports.src.area.NotificationArea;

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new NotificationIndicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator, 99,'right');
        
        
        
        this._area = new NotificationArea();
        Main.uiGroup.add_child(this._area);

        this._indicator.connect("button-press-event", () => {
            this._area._ToggleNotificationArea();
        });
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
