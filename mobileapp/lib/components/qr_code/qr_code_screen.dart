import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';

class QrCodeScreen extends StatelessWidget {
  const QrCodeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;

    return Scaffold(
      appBar: AppBar(
        title: const Text('คิวอาร์โค้ดของฉัน'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: user != null && user.qrCodeId.isNotEmpty
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  QrImageView(
                    data: user.qrCodeId,
                    version: QrVersions.auto,
                    size: 300.0,
                    backgroundColor: Colors.white,
                    errorCorrectionLevel: QrErrorCorrectLevel.M,
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'Name: ${user.displayName}',
                    style: const TextStyle(fontSize: 18),
                  ),
                  Text(
                    'MS ID: ${user.msId}',
                    style: const TextStyle(fontSize: 18 , color: Colors.deepPurple),
                  ),
                ],
              )
            : const Text('No QR Code available'),
      ),
    );
  }
}