# Metrics

This document lists all metrics sent to the external metric system.

## Document's metrics

```
<gauge> keeper_document_total
<gauge> keeper_document_usage,owner=${owner}
<count> keeper_document_event,action=${action},owner=${owner},id=${id}
```

Sample reports:

- Total number of documents
- Total number of documents per owner
- Document actions (CRUD) per owner


## Label's metrics

```
<gauge> keeper_label_total
<gauge> keeper_label_usage,owner=${owner}
<count> keeper_label_event,action=${action},owner=${owner},id=${id}
```

Sample reports:

- Total number of labels
- Total number of labels per owner
- Label actions (CRUD) per owner

## Sharing metrics

```
<gauge> keeper_sharing_total
<gauge> keeper_sharing_usage,owner=${owner}
<count> keeper_sharing_event,action=${action},owner=${owner},id=${id}
```

Sample reports:

- Total number of sharing
- Total number of sharing per owner
- Sharing actions (CRUD) per owner

## Webhook's metrics

```
<gauge> keeper_webhook_total
<gauge> keeper_webhook_usage,owner=${owner}
<count> keeper_webhook_event,action=${action},owner=${owner},id=${id}
<timer> keeper_webhook_call,status=${status}owner=${owner},id=${id}
```

Sample reports:

- Total number of webhooks
- Total number of webhooks per owner
- Webhook actions (CRUD) per owner
- Webhook calls

## User's metrics

```
<gauge> keeper_user_total
<count> keeper_user_event,action=${action},uid=${uid}
```

Sample reports:

- Total number of users
- User actions (CRUD, AuthN rejection)

## Storage metrics

```
<gauge> keeper_storage_total
<gauge> keeper_storage_usage,owner=${owner}
```

Sample reports:

- Total storage usage
- Total storage usage per owner

## Job's metrics

```
<timer> keeper_processed_job,name=${name},status=${status}
```

Sample reports:

- Job duration by name


---

