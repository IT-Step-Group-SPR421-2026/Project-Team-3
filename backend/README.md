# Habit Heatmap Tracker Backend

Це API-only бекенд для трекеру звичок на Django + Django REST Framework.
Фронтенд (React) спiлкується з ним через JSON API.

## Як запустити локально

1. Створити i активувати вiртуальне середовище.
2. Встановити залежностi.
3. Створити i налаштувати .env.
4. Запустити мiграцiї.
5. Запустити сервер.

Приклад команд (macOS/Linux):

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

## Конфiгурацiя (.env)

У коренi папки backend знаходиться файл .env з базовими змiнними:

- DJANGO_SECRET_KEY
- DJANGO_DEBUG
- DJANGO_ALLOWED_HOSTS
- DJANGO_CORS_ALLOWED_ORIGINS

Приклад дивись у .env.example.

## Структура проекту (простими словами)

- config/ - головна конфiгурацiя Django проекту.
  - settings.py - всi налаштування: база даних, CORS, встановленi додатки.
  - urls.py - головнi маршрути, пiдключає API пiд /api/.
  - api/urls.py - спiльна точка входу для API-роутерiв.

- habits/ - основний додаток проекту з логiкою звичок.
  - models.py - моделі Habit i CheckIn (звичка i щоденна вiдмiтка).
  - admin.py - реєстрацiя моделей у Django Admin.
  - api/
    - serializers.py - перетворює моделi у JSON i назад.
    - views.py - API ендпоiнти для Habit та CheckIn.
    - urls.py - маршрути для /api/habits/ i /api/checkins/.

## API коротко

Базова адреса: http://localhost:8000/api/

Доступнi ендпоiнти:

- /habits/
- /checkins/

## Як працювати в командi

- Не ускладнювати архiтектуру без потреби.
- Змiни в моделях завжди супроводжуються мiграцiями.
- JSON-only API: нiяких HTML-вiдповiдей з бекенду.
- Простi, читабельнi серiалiзатори i viewsets.

## Порада

Якщо фронтенд не бачить бекенд, перевiрте:

- чи запущений Django сервер;
- чи правильний CORS домен у .env;
- чи API доступний за /api/habits/.
