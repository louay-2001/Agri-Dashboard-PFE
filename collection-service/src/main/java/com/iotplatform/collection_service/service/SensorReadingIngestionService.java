package com.iotplatform.collection_service.service;

public interface SensorReadingIngestionService {

    void ingest(String topic, String payload);
}
