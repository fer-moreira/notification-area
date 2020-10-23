/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

const St = imports.gi.St;
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;

const Me = imports.misc.extensionUtils.getCurrentExtension();

const Container = Me.imports.src.container;
const Indicator = Me.imports.src.indicator;

let notificationArea;
let notificationIndicator;


function enable () {
    notificationArea = new Container.NotificationArea();
    notificationIndicator = new Indicator.NotificationIndicator();

    notificationIndicator.connect("button-press-event", () => {
        notificationArea._toggleNotificationArea();
    });
}

function disable () {
    notificationArea.destroy();
    notificationIndicator.destroy();
}
