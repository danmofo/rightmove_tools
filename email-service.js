const env = require('dotenv').config();
const sendgridMail = require('@sendgrid/mail');
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

const recipient = process.env.ALERT_RECIPIENT;
const verifiedSenderEmail = process.env.SENDGRID_VERIFIED_SENDER_EMAIL;
const templateId = process.env.SENDGRID_TEMPLATE_ID;

module.exports = {
	async sendAlertEmail(property) {
		if(!recipient || !verifiedSenderEmail || !templateId) {
			throw new Error('Incorrect configuration, set ALERT_RECIPIENT and/or SENDGRID_VERIFIED_SENDER_EMAIL and/or SENDGRID_TEMPLATE_ID inside the .env file.')
		}

		console.log(`Sending email alert to ${recipient}`);

		const message = {
			to: recipient,
			from: verifiedSenderEmail,
			templateId: templateId,
			dynamicTemplateData: {
				"property": property
			}
		};

		await sendgridMail.send(message);
	}
}

