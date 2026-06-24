### Global chat routes
> This chat route is permanent and will never be deleted.

[http://localhost:2025/chats](http://localhost:2025/chats)

[http://localhost:2025/chats?lobby=chat_1](http://localhost:2025/chats?lobby=chat_1)

[http://localhost:2025/chats?lobby=chat_2](http://localhost:2025/chats?lobby=chat_2)

---
### Temporary chat
> This chat route is temporary and dynamically generated (look in line 41 index.js).
It has a life span of approximately 4 minutes.

To generate a new temporary chat lobby:
```
http://localhost:2025/chats/new/{desired lobby name}
```
> This will give you a link and message in json format.

To go to the lobby, you can copy the link provided or
Use this templated link and paste the id.
```
http://localhost:2025/chats/temp_chats?lobby={lobby id}
```

---

> The current code needs heavy refactoring. Maybe
a better framework to work of off but for now it lowk
kinda works.
