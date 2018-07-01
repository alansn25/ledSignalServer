
var serverToProducGeneralTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/app/#`;
}

var productToServerActiveTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/active`;
}

var serverToProductCommandTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/app/cmd/led`;
}

var productToServerCommandFeedbackTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/lsig/cmd/led`;
}

var serverToProductRequestLedStatusTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/app/req/info/led`;
}

var productToServerRequestLedStatusReplyTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/lsig/req/info/led`;
}

var serverToProductRequestFirmwareInfoTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/app/req/info/firmware`;
}

var productToServerRequestFirmwareInfoReplyTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/lsig/req/info/firmware`;
}

var serverToProductRequestStatusInfoTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/app/req/info/status`;
}

var productToServerRequestStatusInfoReplyTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/lsig/req/info/status`;
}

var serverToProductRequestNetworkInfoTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/app/req/info/network`;
}

var productToServerRequestNetworkInfoReplyTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/lsig/req/info/network`;
}

var serverToProductRequestGlobalInfoTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/app/req/info/global`;
}

var productToServerRequestGlobalInfoReplyTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/lsig/req/info/global`;
}

var serverToProductFirmwareUpdateTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/app/cmd/update/start`;
}

var productToServerFirmwareUpdateReplyTopic = (macAddress) =>{
    return `ledsig/v1/${macAddress}/lsig/update/start`;
}




