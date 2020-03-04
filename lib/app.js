/**
 * @description this the entry point for the application
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
		// fm components
		this.applicationId = 'live-switch-mcu-test'
		this.uniqueDeviceIdentification = uniqueIdentification();
		this.uniqueUserIdentification = uniqueIdentification();
		this.endpoint = 'http://ec2-13-127-65-239.ap-south-1.compute.amazonaws.com:8080/sync';
		this.sharedSecret = '82bfb27b882c46b2bd2c5605abfb4085274c49c5a9c3458d8086849cddca38ce';
		this.channel = undefined;
		this.client = undefined;
		this.roles = ['role1', 'role2'];
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
		 * functio to show success message for 5 seconds
		 */
		this.showSuccess = function (message) {
			this.successMessageContainer.style.display = 'block';
			this.successMessage.innerHTML = message;
			setTimeout(() => {
				this.successMessageContainer.style.display = 'none';
			}, 5000);
		}
	}

	/**
	 * set the username of the user.
	 * @todo make a check to make sure it's unique
	 */
	App.prototype.setUsername = function (userName) {
		this.uniqueUserIdentification = userName;
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
});

const uniqueIdentification = () => Number((Math.random() * 10000000000000)).toFixed(0);