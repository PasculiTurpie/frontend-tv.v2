const ipMulticastRegex =
    /^(2(?:[0-4]\d|5[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5]))$/;

const ipGestionRegex = /^172\.1[9]\.14\.([1-2])([1-9]{2})$/;

const ipVideoMulticast = /^(192.168)?\.(\d{1,3}\.)\d{1,3}$/;

const emailValidate = /^([A-Z])(\w+[a-z])\.([A-Z])(\w+[a-z])(.[@])grupogtd\.com$/

export {ipMulticastRegex, ipGestionRegex, ipVideoMulticast, emailValidate}