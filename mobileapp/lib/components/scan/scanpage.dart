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
        title: const Text(
          'สแกน QR Code กิจกรรม',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
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
      appBar: AppBar(
        centerTitle: true,
        title: const Text(
          'สแกน QR Code กิจกรรม',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 20,
          ),
        ),
       backgroundColor: const Color.fromARGB(255, 94, 32, 142),
        elevation: 5,
        shadowColor: Colors.black.withOpacity(0.3),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.deepPurple[50]!,
              Colors.white,
            ],
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
               
                Image.asset(
                  'assets/images/Logo_up.svg.png', 
                  height: 120, 
                  errorBuilder: (context, error, stackTrace) {
                    return const Icon(
                      Icons.error,
                      size: 120,
                      color: Colors.red,
                    ); 
                  },
                ),
                const SizedBox(height: 24),
                // Title
                const Text(
                  'เข้าร่วมกิจกรรม',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.deepPurple,
                  ),
                ),
                const SizedBox(height: 12),
                // Description
                const Text(
                  'สแกน QR Code ของกิจกรรมเพื่อเข้าร่วม\nและบันทึกการเข้าร่วมกิจกรรม',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Color.fromARGB(255, 106, 106, 106),
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 32),
                // Scan Button
                ElevatedButton.icon(
                  onPressed: () => _scanQrCode(context),
                  icon: const Icon(
                    Icons.qr_code_scanner,
                    size: 24,
                    color: Colors.white,
                  ),
                  label: const Text(
                    'เริ่มสแกน',
                    style: TextStyle(
                      fontSize: 18,
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                    elevation: 8,
                    shadowColor: Colors.black.withOpacity(0.3),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}