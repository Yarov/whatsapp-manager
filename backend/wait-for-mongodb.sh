#!/bin/bash
# wait-for-mongodb.sh

set -e

host="mongodb"
port="27017"
timeout=30
sleeptime=1

echo "Esperando a que MongoDB ($host:$port) esté disponible..."

# Esperar hasta que MongoDB responda o hasta que se agote el tiempo de espera
start_time=$(date +%s)
while true; do
  current_time=$(date +%s)
  elapsed_time=$((current_time - start_time))

  # Verificar si se ha agotado el tiempo de espera
  if [ $elapsed_time -ge $timeout ]; then
    echo "Tiempo de espera agotado después de $timeout segundos"
    exit 1
  fi

  # Intentar conectarse a MongoDB
  if nc -z $host $port > /dev/null 2>&1; then
    echo "MongoDB está disponible después de $elapsed_time segundos"
    break
  fi

  echo "Esperando a MongoDB... ($elapsed_time segundos transcurridos)"
  sleep $sleeptime
done

# Esperar un poco más para asegurar que MongoDB esté completamente inicializado
echo "Esperando 5 segundos adicionales para asegurar la inicialización completa..."
sleep 5

# Ejecutar el comando proporcionado
echo "Ejecutando: $@"
exec "$@"