import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../models/project.dart';

class QrCodeActivity extends StatelessWidget {
  final Project project;

  const QrCodeActivity({super.key, required this.project});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('QR Code: ${project.projectName}')),
      body: Center(
        child: project.qrCodeData != null && project.qrCodeData!.isNotEmpty
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  QrImageView(
                    data: project.qrCodeData!,
                    version: QrVersions.auto,
                    size: 200.0,
                    backgroundColor: Colors.white,
                    errorCorrectionLevel: QrErrorCorrectLevel.M,
                  ),
                  const SizedBox(height: 20),
                  Text('Project ID: ${project.projectId}'),
                  Text('QR Data: ${project.qrCodeData}'),
                  const Text('สแกนเพื่อเข้าร่วม'),
                ],
              )
            : const Text('ไม่มี QR Code สำหรับกิจกรรมนี้'),
      ),
    );
  }
}
