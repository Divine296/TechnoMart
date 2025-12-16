from asgiref.sync import async_to_sync
from channels.layers import InMemoryChannelLayer
from django.test import SimpleTestCase

from api import events
from api.events import publish_event


class PublishEventTests(SimpleTestCase):
    def test_publish_event_sends_to_expected_groups(self):
        layer = InMemoryChannelLayer()

        original = events.get_channel_layer
        events.get_channel_layer = lambda: layer
        self.addCleanup(lambda: setattr(events, "get_channel_layer", original))

        manager_channel = async_to_sync(layer.new_channel)()
        user_channel = async_to_sync(layer.new_channel)()
        custom_channel = async_to_sync(layer.new_channel)()
        broadcast_channel = async_to_sync(layer.new_channel)()

        async_to_sync(layer.group_add)("role_manager", manager_channel)
        async_to_sync(layer.group_add)("user_user-1", user_channel)
        async_to_sync(layer.group_add)("custom", custom_channel)
        async_to_sync(layer.group_add)("broadcast", broadcast_channel)

        publish_event(
            "order.status_changed",
            {"orderId": "123", "status": "ready"},
            roles=["manager"],
            user_ids=["user-1"],
            audience=["custom"],
        )

        manager_msg = async_to_sync(layer.receive)(manager_channel)
        self.assertEqual(manager_msg["event"], "order.status_changed")
        self.assertEqual(manager_msg["payload"]["status"], "ready")

        user_msg = async_to_sync(layer.receive)(user_channel)
        self.assertEqual(user_msg["event"], "order.status_changed")

        custom_msg = async_to_sync(layer.receive)(custom_channel)
        self.assertEqual(custom_msg["event"], "order.status_changed")

        broadcast_msg = async_to_sync(layer.receive)(broadcast_channel)
        self.assertEqual(broadcast_msg["event"], "order.status_changed")
