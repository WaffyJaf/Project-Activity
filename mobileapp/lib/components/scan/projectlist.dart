import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:mobileapp/models/project.dart';
import '../../services/projectapi.dart';
import '../qr_code/qr_code_project.dart'; 

enum SortOption { newest, oldest }

class ProjectView extends StatefulWidget {
  const ProjectView({super.key});

  @override
  State<ProjectView> createState() => _ProjectViewState();
}

class _ProjectViewState extends State<ProjectView> {
  SortOption _sortOption = SortOption.newest;
  bool _isScanning = false;

  List<Project> _sortProjects(List<Project> projects) {
    switch (_sortOption) {
      case SortOption.newest:
        return projects..sort((a, b) => b.createdDate.compareTo(a.createdDate));
      case SortOption.oldest:
        return projects..sort((a, b) => a.createdDate.compareTo(b.createdDate));
    }
  }

  void _scanQrCode(BuildContext context, Project project) async {
  if (_isScanning) return;
  setState(() => _isScanning = true);

  await showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => AlertDialog(
      title: const Text('สแกน QR Code นิสิต'),
      content: SizedBox(
        height: 300,
        width: 300,
        child: MobileScanner(
          onDetect: (barcodeCapture) async {
            final String? qrCodeId = barcodeCapture.barcodes.first.rawValue;
            if (qrCodeId != null && _isScanning) {
              try {
                // ส่ง projectId และ qrCodeId ไปยัง API
                await ApiProject().recordAttendance(
                  project.projectId.toString(),
                  qrCodeId, // ใช้ qrCodeId จากนิสิต
                );

                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('บันทึกการเข้าร่วมสำเร็จ')),
                  );
                }
              } catch (e) {
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
    return RefreshIndicator(
      onRefresh: () async {
        setState(() {});
      },
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Align(
              alignment: Alignment.centerRight,
              child: DropdownButton<SortOption>(
                value: _sortOption,
                onChanged: (SortOption? newValue) {
                  setState(() {
                    _sortOption = newValue!;
                  });
                },
                items: SortOption.values.map((SortOption option) {
                  return DropdownMenuItem<SortOption>(
                    value: option,
                    child: Text(option == SortOption.newest ? 'ใหม่สุด' : 'เก่าสุด'),
                  );
                }).toList(),
              ),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Project>>(
              future: ApiProject().fetchProjectActivities(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('เกิดข้อผิดพลาด: ${snapshot.error}'),
                        ElevatedButton(
                          onPressed: () => setState(() {}),
                          child: const Text('ลองใหม่'),
                        ),
                      ],
                    ),
                  );
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('ไม่พบโครงการ'));
                }

                final projects = _sortProjects(snapshot.data!);
                return ListView.builder(
                  itemCount: projects.length,
                  itemBuilder: (context, index) {
                    final project = projects[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                      child: ListTile(
                        leading: const Icon(Icons.folder_copy_rounded, size: 40),
                        title: Text(project.projectName),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('วันที่สร้าง: ${project.createdDate.toLocal().toString().substring(0, 16)}'),
                            Text(
                              'สถานะ: ${project.projectStatus}',
                              style: TextStyle(
                                color: project.projectStatus.toLowerCase() == 'approved'
                                    ? Colors.green
                                    : Colors.orange,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.qr_code_scanner),
                              tooltip: 'สแกน QR Code นิสิต',
                              onPressed: () => _scanQrCode(context, project),
                            ),
                            IconButton(
                              icon: const Icon(Icons.qr_code),
                              tooltip: 'แสดง QR Code กิจกรรม',
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => QrCodeActivity(project: project),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}