from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/scale/(?P<pos_id>\w+)/$', consumers.ScaleConsumer.as_asgi()),
]
