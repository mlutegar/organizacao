# Sidebar (0)

Eu quero que os botões de tipo de visualição de tarefas (todas, inbox, por projeto, finalizada hoje) fique tudo no sidebar, um encima do outro, ao invés de ficar na parte superior da página de tarefas.

Eu quero que a sidebar tenha +- a seguinte estrutura:
```text
(+) Adicionar Tarefa
Inbox
Todas as Tarefas
Finalizadas Hoje

-----
Projetos (+) botao de adicionar projeto

- projeto1
- projeto2
- projeto3
```

@packages/web/src/app/tasks/page.tsx
@packages/web/src/components/Sidebar.tsx