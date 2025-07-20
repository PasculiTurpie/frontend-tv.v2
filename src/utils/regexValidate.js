const ipMulticastRegex =
    /^(2(?:[0-4]\d|5[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(?:[0-9]{1,2}|1\d\d|2[0-4]\d|25[0-5]))$/;

const ipGestionRegex = /^172\.1[9]\.14\.([1-2])([1-9]{2})$/;

const ipVideoMulticast = /^(192.168)?\.(\d{1,3}\.)\d{1,3}$/;

const emailValidate = /^[A-Z][a-z]+\.([A-Z][a-z]+)@grupogtd\.com$/;

const otherEmail= /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


const phoneValidate = /^(?:\+?56)?(?:0)?(9\d{8}|[2-9]\d{7})$/;

export {
    ipMulticastRegex,
    ipGestionRegex,
    ipVideoMulticast,
    emailValidate,
    phoneValidate,
    otherEmail,
};