import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../services/login_api.dart';
import 'dart:async';


class Notification {
  final int id;
  final String msId;
  final String title;
  final String? body;
  final bool read;
  final DateTime createdAt;
  final int? eventId;

  Notification({
    required this.id,
    required this.msId,
    required this.title,
    this.body,
    required this.read,
    required this.createdAt,
    this.eventId,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    int? _toInt(dynamic v) {
      if (v == null) return null;
      if (v is int) return v;
      if (v is String) return int.tryParse(v);
      return int.tryParse(v.toString());
    }

    Map<String, dynamic>? _toMap(dynamic v) {
      if (v == null) return null;
      if (v is Map<String, dynamic>) return v;
      if (v is String) {
        try { final m = jsonDecode(v); if (m is Map<String, dynamic>) return m; } catch (_) {}
      }
      return null;
    }

    int? _extractEventId(Map<String, dynamic> root) {
      final dataMap = _toMap(root['data']);

      // รองรับทั้งชื่อ event_id / eventId / post_id / postId ทั้งบน root และใน data
      final candidates = [
        root['event_id'], root['eventId'], root['post_id'], root['postId'],
        dataMap?['event_id'], dataMap?['eventId'], dataMap?['post_id'], dataMap?['postId'],
      ];

      for (final c in candidates) {
        final v = _toInt(c);
        if (v != null) return v;
      }
      return null;
    }

    bool _toBool(dynamic v) => v == true || v == 1 || v == '1';

    final evId = _extractEventId(json);
    // debug ช่วยดู payload
    // debugPrint('Notif.fromJson => id=${json['id']} eventId=$evId data=${json['data']}');

    return Notification(
      id: json['id'] as int,
      msId: (json['ms_id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      body: json['body']?.toString(),
      read: _toBool(json['read']),
      createdAt: DateTime.parse(json['created_at'].toString()),
      eventId: evId,
    );
  }
}

class NotificationProvider with ChangeNotifier {
  
  List<Notification> _notifications = [];
  bool _isLoading = false;
  bool _isFetching = false; // เพิ่มตัวแปรควบคุมการ fetch
  Timer? _pollingTimer; // เพิ่ม Timer สำหรับ polling

  List<Notification> get notifications => _notifications;
  bool get isLoading => _isLoading;
  int get unreadCount => _notifications.where((n) => !n.read).length;

  // เริ่ม polling
  void startPolling(String msId) {
    stopPolling(); // หยุด timer เดิมก่อน
    _pollingTimer = Timer.periodic(Duration(seconds: 30), (timer) {
      fetchNotifications(msId); // เรียกทุก 30 วินาที
    });
  }

  // หยุด polling
  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  Future<void> fetchNotifications(String msId) async {
    if (_isFetching) return; // ป้องกันการเรียกซ้ำ
    _isFetching = true;
    _isLoading = true;

    try {
      print('เรียก GET /notifications สำหรับ msId: $msId');
      final loginApi = LoginApi();
      final authToken = await loginApi.getToken();
      print('Auth Token สำหรับ fetchNotifications: $authToken');
      if (authToken == null) {
        print('Error: ไม่พบ authentication token');
        throw Exception('ไม่พบ authentication token');
      }

      final response = await http.get(
        Uri.parse('http://10.0.2.2:3000/notifications?ms_id=$msId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
      );

      print('สถานะการตอบสนองจาก GET /notifications: ${response.statusCode}');
      print('เนื้อหาการตอบสนอง: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        final newNotifications = data.map((json) => Notification.fromJson(json)).toList();

        // ตรวจสอบว่า notifications เปลี่ยนแปลงหรือไม่
        if (!_areNotificationsEqual(_notifications, newNotifications)) {
          _notifications = newNotifications;
          notifyListeners();
        }
      } else {
        throw Exception('Failed to fetch notifications: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('ข้อผิดพลาดใน fetchNotifications: $e');
      throw e;
    } finally {
      _isFetching = false;
      _isLoading = false;
      notifyListeners();
    }
  }

  // เปรียบเทียบ notifications เพื่อป้องกันการอัปเดตที่ไม่จำเป็น
  bool _areNotificationsEqual(List<Notification> oldList, List<Notification> newList) {
    if (oldList.length != newList.length) return false;
    for (int i = 0; i < oldList.length; i++) {
      if (oldList[i].id != newList[i].id ||
          oldList[i].read != newList[i].read ||
          oldList[i].title != newList[i].title ||
          oldList[i].body != newList[i].body ||
          oldList[i].eventId != newList[i].eventId) {
        return false;
      }
    }
    return true;
  }

  Future<void> markAsRead(int notificationId) async {
    try {
      final loginApi = LoginApi();
      final authToken = await loginApi.getToken();
      if (authToken == null) {
        print('Error: ไม่พบ authentication token');
        return;
      }

      final response = await http.put(
        Uri.parse('http://10.0.2.2:3000/notifications/$notificationId/read'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
      );

      if (response.statusCode == 200) {
        final index = _notifications.indexWhere((n) => n.id == notificationId);
       if (index != -1) {
        _notifications[index] = Notification(
          id: _notifications[index].id,
          msId: _notifications[index].msId,
          title: _notifications[index].title,
          body: _notifications[index].body,
          read: true,
          createdAt: _notifications[index].createdAt,
          eventId: _notifications[index].eventId,
        );

        notifyListeners();
      }
        print('Notification $notificationId marked as read');

      } else {
        print('Failed to mark notification as read: ${response.statusCode}');
      }
    } catch (e) {
      print('Error marking notification as read: $e');
    }
  }

  void clearNotifications() {
    _notifications = [];
    notifyListeners();
  }

  @override
  void dispose() {
    stopPolling();
    super.dispose();
  }
}