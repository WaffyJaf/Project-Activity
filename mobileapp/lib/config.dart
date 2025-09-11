import 'dart:io';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get baseUrl {
    final emulatorUrl = dotenv.env['EMULATOR_BASE_URL'] ?? 'http://10.0.2.2:3000';
    final deviceUrl   = dotenv.env['DEVICE_BASE_URL']   ?? 'http://172.20.10.3:3000';
    final iosUrl      = dotenv.env['IOS_BASE_URL']      ?? 'http://localhost:3000';

    if (Platform.isAndroid) {
      return emulatorUrl;
    } else if (Platform.isIOS) {
      return iosUrl;
    } else {
      return deviceUrl;
    }
  }
}
