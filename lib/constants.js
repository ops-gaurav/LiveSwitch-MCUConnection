/**
 * @description the static file to contain the application constants
 * @author gaurav sharma
 */
/**
 * This represents the clent connection state mapping
 * the documentation can be found at
 * @see https://docs.frozenmountain.com/liveswitch/api/TypeScript/enums/fm.liveswitch.clientstate.html
 * and is used by Client.getState() to represent the state of a fm client
 * instance. Could be used to represent the client state
 */
const CLIENT_STATE_MAPPING = {
	1: 'New',
	3: 'Registered',
	2: 'Registering',
	5: 'Unregistered',
	4: 'Unregistering',
};
