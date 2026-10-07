export type PatientNotification = {
  email?: string | null;
  phone?: string | null;
  subject: string;
  message: string;
};

export async function notifyPatient(notification: PatientNotification) {
  const webhook = process.env.PATIENT_NOTIFICATION_WEBHOOK_URL;
  if (!webhook) {
    console.info(`[Patient notification] ${notification.subject}`, {
      email: notification.email ?? undefined,
      phone: notification.phone ?? undefined,
    });
    return { email: false, sms: false, queued: false };
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(notification),
    });
    return { email: Boolean(notification.email) && response.ok, sms: Boolean(notification.phone) && response.ok, queued: response.ok };
  } catch (error) {
    console.warn("[Patient notification] Provider request failed", error);
    return { email: false, sms: false, queued: false };
  }
}