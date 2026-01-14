#!/bin/sh

set -e

echo "[Entrypoint] Script iniciado."

SESSIONS_DIR="/app/profiles"

if [ ! -d "$SESSIONS_DIR" ]; then
    echo "[Entrypoint] Diretório de sessões não encontrado. Criando..."
    mkdir -p "$SESSIONS_DIR"
fi

echo "[Entrypoint] Procurando por links simbólicos 'SingletonLock' em ${SESSIONS_DIR}..."

find "$SESSIONS_DIR" -type l -name "SingletonLock" | while IFS= read -r locklink; do
    echo "[Entrypoint] Link simbólico SingletonLock encontrado: ${locklink}. Removendo..."
    rm -f "$locklink"
    echo "[Entrypoint] Link simbólico removido."
done

echo "[Entrypoint] Limpeza concluída. Iniciando a aplicação principal..."

exec "$@"