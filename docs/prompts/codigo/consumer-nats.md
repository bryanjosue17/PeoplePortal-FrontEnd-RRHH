# Prompt: Consumer NATS JetStream

## Contexto
Sistema con NATS JetStream para eventos de dominio.
Se necesita un background service que consuma eventos.

## Prompt usado
"Genera un BackgroundService en .NET que consuma eventos de NATS JetStream
usando NATS.Net. Los eventos son hr.request.submitted y hr.request.approved.
Usa DI con ILogger para logs."

## Resultado
EventConsumerService creado en Infrastructure/Messaging/
