import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';
import '../../services/projectapi.dart';

class ScanActivityScreen extends StatefulWidget {
  const ScanActivityScreen({super.key});

  @override
  State<ScanActivityScreen> createState() => _ScanActivityScreenState();
}

class _ScanActivityScreenState extends State<ScanActivityScreen> {
  bool _isScanning = false;

  void _scanQrCode(BuildContext context) async {
    if (_isScanning) return;
    setState(() => _isScanning = true);

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('สแกน QR Code กิจกรรม'),
        content: SizedBox(
          height: 300,
          width: 300,
          child: MobileScanner(
            onDetect: (barcodeCapture) async {
              final String? qrCodeData = barcodeCapture.barcodes.first.rawValue;
              if (qrCodeData != null && _isScanning) {
                try {
                  print('Scanned qrCodeData: $qrCodeData'); // Debug
                  final user = Provider.of<UserProvider>(context, listen: false).user;
                  if (user == null || user.qrCodeId.isEmpty) {
                    throw Exception('ไม่พบข้อมูลผู้ใช้');
                  }
                  print('User qrCodeId: ${user.qrCodeId}'); // Debug

                  await ApiProject().joinActivity(qrCodeData, user.qrCodeId);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('เข้าร่วมกิจกรรมสำเร็จ')),
                    );
                  }
                } catch (e) {
                  print('Error: $e'); // Debug
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('เกิดข้อผิดพลาด: $e')),
                    );
                  }
                } finally {
                  if (mounted) {
                    Navigator.pop(context);
                    setState(() => _isScanning = false);
                  }
                }
              }
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() => _isScanning = false);
            },
            child: const Text('ยกเลิก'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('สแกน QR Code กิจกรรม')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => _scanQrCode(context),
          child: const Text('เริ่มสแกน'),
        ),
      ),
    );
  }
}