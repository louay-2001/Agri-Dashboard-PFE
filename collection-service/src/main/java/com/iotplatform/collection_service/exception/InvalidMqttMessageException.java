package com.iotplatform.collection_service.exception;

public class InvalidMqttMessageException extends RuntimeException {

    public InvalidMqttMessageException(String message) {
        super(message);
    }
}
