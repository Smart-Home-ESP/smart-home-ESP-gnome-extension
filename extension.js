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

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const {
	GObject,
	St
} = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;

//the library to work with http request
const Soup = imports.gi.Soup;

const Indicator = GObject.registerClass(
	class Indicator extends PanelMenu.Button {
		_init() {

			super._init(0.0, _('My Shiny Indicator'));

			this.add_child(new St.Icon({
				icon_name: 'go-home',
				style_class: 'system-status-icon',
			}));

			let ledDesk = new PopupMenu.PopupMenuItem(_('LED Desk'));

			ledDesk.connect('activate', () => {
				this.httpRequest("http://192.168.1.214:9999/changeDeviceStatus-http/12345", "LED Desk");
			});
			this.menu.addMenuItem(ledDesk);


			let mainLight = new PopupMenu.PopupMenuItem(_('Main Light'));
			mainLight.connect('activate', () => {
				this.httpRequest("http://192.168.1.214:9999/changeDeviceStatus-http/55555", "Main Light");
			});
			this.menu.addMenuItem(mainLight);

			let deskLamp = new PopupMenu.PopupMenuItem(_('Desk Lamp'));
			deskLamp.connect('activate', () => {
				this.httpRequest("http://192.168.1.214:9999/changeDeviceStatus-http/82340", "Desk Lamp");

			});

			this.menu.addMenuItem(deskLamp);

			let offAll = new PopupMenu.PopupMenuItem(_('Turn Off All'));
			offAll.connect('activate', () => {
				this.httpRequest("http://192.168.1.214:9999/turn-off-all", "Turn Off All");

			});
			this.menu.addMenuItem(offAll);

			this.menu.addMenuItem(deskLamp);

			let onAll = new PopupMenu.PopupMenuItem(_('Turn On All'));
			onAll.connect('activate', () => {
				this.httpRequest("http://192.168.1.214:9999/turn-on-all", "Turn On All");
			});
			this.menu.addMenuItem(onAll);
		}

		httpRequest(url, name) {
			let _httpSession = new Soup.Session();
			let params = {};
			let message = Soup.form_request_new_from_hash('GET', url, params);
			_httpSession.queue_message(message, Lang.bind(this,
				function(_httpSession, message) {
					if (message.status_code !== 200) {
						log(message.status_code);
						Main.notify(_('ERROR - status code: ' + message));
					} else {
						Main.notify(_(name));
						return;
					}
				}));
		}
	});

class Extension {
	constructor(uuid) {
		this._uuid = uuid;

		ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
	}

	enable() {
		this._indicator = new Indicator();
		Main.panel.addToStatusArea(this._uuid, this._indicator);
	}

	disable() {
		this._indicator.destroy();
		this._indicator = null;
	}
}

function init(meta) {
	return new Extension(meta.uuid);
}