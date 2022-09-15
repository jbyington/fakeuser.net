//#############################################################################
//
//	WSS Service
//
//#############################################################################

//=============================================================================
//
//	Requires
//
//=============================================================================

var baseService = require('../_');

//=============================================================================
//
//	Create socket server
//
//=============================================================================

class service extends baseService {
	constructor(config) {
		super(config);

		this.socket = config.socket;
		this.expressWs = config.expressWs;

		this.route = require('./route')(this);

		return this;
	}

	//=============================================================================
	//	Broadcasts
	//=============================================================================

	globalBroadcast(data) {
		let socket = this.socket;
		if (typeof data == 'object') {
			data = JSON.stringify(data);
		}
		if (this.hasClients()) {
			socket.clients.forEach(function (ws) {
				ws.send(data);
			});
		}
	}

	roomcast(room, data) {
		return this.broadcast(
			{
				room: room,
				readyState: 1,
			},
			data
		);
	}

	broadcast(currentClient, data) {
		let expressWs = this.expressWs;
		if (typeof data == 'object') {
			data = JSON.stringify(data);
		}
		return expressWs.broadcast(currentClient, data);
	}

	//=============================================================================
	//	hasClients
	//=============================================================================

	hasClients() {
		let socket = this.socket;
		return socket.clients.size > 0;
	}

	//=============================================================================
	//	Initialize
	//=============================================================================

	initialize() {
		super.app().locals.services = {
			...super.app().locals.services,
			wss: {
				broadcast: this.broadcast,
				roomcast: this.roomcast,
				hasClients: this.hasClients,
				socket: this.socket,
				expressWs: this.expressWs,
			},
		};
		return this;
	}
}

module.exports = service;
