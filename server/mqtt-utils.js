

class MqttUtils {
    constructor(){
        this.products= [];      
    }


    serverToProducGeneralTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/#`;
    }

    productToServerActiveTopic (macAddress) {
        return `ledsig/v1/${macAddress}/active`;
    }

    serverToProductCommandTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/cmd/led`;
    }

    productToServerCommandFeedbackTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/cmd/led`;
    }

    serverToProductRequestLedStatusTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/req/info/led`;
    }

    productToServerRequestLedStatusReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/req/info/led`;
    }

    serverToProductRequestFirmwareInfoTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/req/info/firmware`;
    }

    productToServerRequestFirmwareInfoReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/req/info/firmware`;
    }

    serverToProductRequestStatusInfoTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/req/info/status`;
    }

    productToServerRequestStatusInfoReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/req/info/status`;
    }

    serverToProductRequestNetworkInfoTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/req/info/network`;
    }

    productToServerRequestNetworkInfoReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/req/info/network`;
    }

    serverToProductRequestGlobalInfoTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/req/info/global`;
    }

    productToServerRequestGlobalInfoReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/req/info/global`;
    }

    serverToProductFirmwareUpdateTopic (macAddress) {
        return `ledsig/v1/${macAddress}/app/cmd/update/start`;
    }

    productToServerFirmwareUpdateReplyTopic (macAddress) {
        return `ledsig/v1/${macAddress}/lsig/update/start`;
    }

    getMacFromTopic(topic) {
        var splittedTopic = topic.split('/');
        return splittedTopic[2];
    }

}

