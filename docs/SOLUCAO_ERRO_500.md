# Solução para Erro 500 - Múltiplas Instâncias do Servidor

## Problema

O erro 500 está acontecendo porque há múltiplas instâncias do servidor Next.js rodando nas portas 3000, 3001, 3002, 3003.

## Solução

### Opção 1: Pelo Terminal (Recomendado)

**Windows (PowerShell ou CMD):**
```bash
# Matar todos os processos Node.js
taskkill /F /IM node.exe

# Limpar cache do Next.js
cd C:\Users\mlute\WebstormProjects\organizacao\packages\web
rmdir /s /q .next

# Reiniciar o servidor
cd C:\Users\mlute\WebstormProjects\organizacao
yarn web
```

**Mac/Linux (Terminal):**
```bash
# Matar todos os processos Node.js
pkill -f node

# Limpar cache do Next.js
cd /c/Users/mlute/WebstormProjects/organizacao/packages/web
rm -rf .next

# Reiniciar o servidor
cd /c/Users/mlute/WebstormProjects/organizacao
yarn web
```

### Opção 2: Matar Processos Específicos

**Windows:**
```bash
# Ver todos os processos Node rodando
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002
netstat -ano | findstr :3003

# Matar processo específico (substitua PID pelo número da última coluna)
taskkill /F /PID <número_do_processo>
```

### Opção 3: Reiniciar o Computador

Se nada funcionar, reinicie o computador para matar todos os processos.

## Após Limpar os Processos

1. Certifique-se de que nenhum servidor está rodando
2. Execute:
   ```bash
   yarn web
   ```
3. Aguarde a mensagem:
   ```
   ✓ Ready in 2s
   - Local: http://localhost:3000
   ```
4. Acesse **apenas** a URL mostrada no terminal (normalmente http://localhost:3000)

## Verificação

Se tudo estiver correto, você verá:
- Apenas UMA porta sendo usada (exemplo: 3000)
- A página carrega sem erro 500
- O console do navegador não mostra erros

## Prevenção

Para evitar este problema no futuro:
- Sempre use `Ctrl+C` para parar o servidor antes de fechar o terminal
- Se fechar o terminal sem parar o servidor, os processos continuam rodando em background
- Use sempre o mesmo terminal para desenvolvimento
