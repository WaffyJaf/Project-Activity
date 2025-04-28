import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';
import '../../services/login_api.dart';
import '../../providers/user_provider.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  _ScanScreenState createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  final MobileScannerController controller = MobileScannerController();
  final _apiService = LoginApi();
  bool _isScanning = true;

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            child: MobileScanner(
              controller: controller,
              onDetect: (BarcodeCapture capture) async {
                if (!_isScanning) return;
                
                final List<Barcode> barcodes = capture.barcodes;
                if (barcodes.isEmpty) return;
                
                final String? code = barcodes.first.rawValue;
                if (code == null) return;
                
                setState(() {
                  _isScanning = false;
                });
                controller.stop();
                
                try {
                  final user = Provider.of<UserProvider>(context, listen: false).user;
                  if (user?.role != 'organizer') {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Only organizers can scan')),
                    );
                    controller.start();
                    setState(() {
                      _isScanning = true;
                    });
                    return;
                  }
                  
                  final result = await _apiService.checkIn(code);
                  final scannedUser = result['scannedUser'];
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Checked in: ${scannedUser['displayName']}')),
                  );
                  Navigator.pop(context);
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString())),
                  );
                  controller.start();
                  setState(() {
                    _isScanning = true;
                  });
                }
              },
              overlay: Container(
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                ),
                child: Center(
                  child: Container(
                    width: 300,
                    height: 300,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.deepPurple,
                        width: 10,
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.deepPurple.withOpacity(0.6),
            child: const Text(
              'Scan QR Code to Check In',
              style: TextStyle(color: Colors.white, fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }
}