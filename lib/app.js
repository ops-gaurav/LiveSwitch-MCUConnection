/**
 * @description this the entry point for the application
 * @author gaurav sharma
 */
// this will initiate the code-block inside once the
// liveswitch library finishes loading

var App = undefined;

fm.liveswitch.Util.addOnLoad(function () {
	App = function () {
		// DOM components
		this.dangerMessageContainer = document.getElementById('danger-container');
		this.errorMessage = document.getElementById('error-message');
		this.successMessageContainer = document.getElementById('success-container');
		this.successMessage = document.getElementById('success-message');
		this.connectButton = document.getElementById('connect-button');
		this.connectionStatus = document.getElementById('connection-status');
		this.channelTextField = document.getElementById('channel-name');
		this.videoContainer = document.getElementById('video-container');
		// fm components
		this.applicationId = 'live-switch-mcu-test'
		this.uniqueDeviceIdentification = uniqueIdentification();
		this.uniqueUserIdentification = uniqueIdentification();
		this.endpoint = 'http://ec2-13-127-65-239.ap-south-1.compute.amazonaws.com:8080/sync';
		this.sharedSecret = '82bfb27b882c46b2bd2c5605abfb4085274c49c5a9c3458d8086849cddca38ce';
		this.channel = undefined;
		this.client = undefined;
		this.roles = ['role1', 'role2'];
		// video configurations
		this.audio = true;
		this.video = true;
		this.localMedia = new fm.liveswitch.LocalMedia(this.audio, this.video);
		this.remoteMedia = new fm.liveswitch.RemoteMedia();
		this.audioStream = new fm.liveswitch.AudioStream(this.localMedia, this.remoteMedia);
		this.videoStream = new fm.liveswitch.VideoStream(this.localMedia, this.remoteMedia);
		this.iceServers = [
			new fm.liveswitch.IceServer('stun:turn.frozenmountain.com:3478'),
			new fm.liveswitch.IceServer('turn:turn.frozenmountain.com:80', 'test', 'pa55w0rd!'),
			new fm.liveswitch.IceServer('turns:turn.frozenmountain.com:443', 'test', 'pa55w0rd!')
		];
		/**
		 * function to show error message for 5 seconds
		 */
		this.showError = function (message) {
			this.dangerMessageContainer.style.display = 'block';
			this.errorMessage.innerHTML = message;
			setTimeout(() => {
				this.dangerMessageContainer.style.display = 'none';
			}, 5000);
		}
		/**
		 * function to show success message for 5 seconds
		 */
		this.showSuccess = function (message) {
			this.successMessageContainer.style.display = 'block';
			this.successMessage.innerHTML = message;
			setTimeout(() => {
				this.successMessageContainer.style.display = 'none';
			}, 5000);
		}

		/**
		 * update the client status based on client state values
		 */
		this.updateClientStatus = function (state) {
			console.log(state);
			if (state == 3) {
				this.connectButton.style.display = 'block';
			}
			this.connectionStatus.innerHTML = CLIENT_STATE_MAPPING[state] || 'New';
		}
	}

	/**
	 * set the username of the user.
	 * @param {String} username the username to set
	 * @todo make a check to make sure it's unique
	 */
	App.prototype.setUsername = function (username) {
		this.uniqueUserIdentification = username;
	}
	/**
	 * establish the connection with the remote
	 * server
	 */
	App.prototype.connect = function () {
		if (this.endpoint && this.applicationId && this.uniqueUserIdentification && this.uniqueDeviceIdentification) {
			this.client = new fm.liveswitch.Client(
				this.endpoint,
				this.applicationId,
				this.uniqueUserIdentification,
				this.uniqueDeviceIdentification,
				null,
				this.roles,
			);
			this.client.addOnStateChange((_client) => {
				this.updateClientStatus(_client.getState());
			});
			// generate client register token
			this.registerToken = fm.liveswitch.Token.generateClientRegisterToken(
				this.applicationId,
				this.client.getUserId(),
				this.client.getDeviceId(),
				this.client.getId(),
				this.client.getRoles(),
				[],
				this.sharedSecret,
			);
			
			this.client.register(this.registerToken)
				.then((channels) => {
					this.channels = channels;
					this.showSuccess('Connected to LiveSwitch server');
				}).fail(err => {
					this.showError('Error estblishing connection');
				});
		} else {
			this.showError('Cannot connect: Some of the required properties missing');
		}
	}

	/**
	 * This is the functinality to join a channel.
	 * the channel will handle the MCU connection and multiple
	 * clients can connect to a single channel
	 * @param {String} channel represents the channel name
	 */
	App.prototype.joinChannel = function (channelName) {
		try {
			if (!channelName) {
				return this.showError('Require a channel name to connect');
			}
			if (this.client.getState() !== 3) {
				return this.showError('Connection is not active');
			}
			// generate the channel join token
			this.channelJoinToken = fm.liveswitch.Token.generateClientJoinToken(
				this.applicationId,
				this.client.getUserId(),
				this.client.getDeviceId(),
				this.client.getId(),
				new fm.liveswitch.ChannelClaim(channelName),
				this.sharedSecret,
			);
			this.client.join(channelName, this.channelJoinToken)
				.then((c) => {
					/**
					 * initiate the MCU connection
					 */
					this.mcuConnection = c.createMcuConnection(this.audioStream, this.videoStream);
					this.layoutManager = new fm.liveswitch.DomLayoutManager(this.videoContainer);

					this.localMedia.start()
						.then((success) => {
							this.showSuccess('Started Recording');
							this.layoutManager.setLocalView(this.localMedia.getView());
							this.layoutManager.addRemoteView(this.remoteMedia.getId(), this.remoteMedia.getView());
							
							this.mcuConnection.setIceServers(this.iceServers);
							this.mcuConnection.open()
								.then((result) => {
									this.showSuccess('Success Setting MCU Connection');
								})
								.fail((err) => this.showError('Error setting up MCU connection'));
						})
						.fail(err => alert(err.message));
					// this.localMedia.start()
					// 	.then((lc) => {
					// 		alert('here')
					// 		// started recording
					// 		this.showSuccess('Started Recording');
					// 		this.layoutManager.setLocalView(this.localMedia.getView());
					// 		this.layoutManager.addRemoteView(this.remoteMedia.getId(), this.remoteMedia.getView());
							
					// 		this.mcuConnection.setIceServers(this.iceServers);
					// 		this.mcuConnection.open()
					// 			.then((result) => {
					// 				this.showSuccess('Success Setting MCU Connection');
					// 			})
					// 			.fail((err) => this.showError('Error setting up MCU connection'));
					// 	}).fail((err) => {
					// 		return this.showError('Error while starting the local media');
					// 	});
				})
				.fail(err => this.showError('Error joining channel'));
		} catch (err) {
			console.log(err);
			this.showError(err.message);
		}
	}
});

const uniqueIdentification = () => Number((Math.random() * 10000000000000)).toFixed(0);