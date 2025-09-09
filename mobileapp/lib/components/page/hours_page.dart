import 'package:flutter/material.dart';
import '../../services/hours_api.dart';

class HoursPage extends StatefulWidget {
  const HoursPage({super.key});

  @override
  State<HoursPage> createState() => _HoursPageState();
}

class _HoursPageState extends State<HoursPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ApiService _apiService = ApiService();

  String? _msId; // ควรดึงจาก Provider/Token จริง
  List<HoursSummary> _yearData = [];
  List<HoursSummary> _sixMonthData = [];
  double _totalHours = 0.0;

  String? _error;
  bool _isLoading = false;

  // กำหนด “เป้าหมายชั่วโมง” เพื่อโชว์ progress (ปรับได้)
  final double _targetHours = 36.0;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);

    _tabController.addListener(() {
      if (mounted) setState(() {});
    });

    // TODO: ดึง msId จาก Provider/Token จริง
    _msId = '64222040@up.ac.th';
    _fetchData();
  }

  // --------- Utils: Format ปีการศึกษาเป็น พ.ศ. ----------
  String formatAcademicYearThai(String? raw, {bool showRange = true}) {
    if (raw == null || raw.trim().isEmpty) return '-';

    final value = raw.trim();
    // ถ้ามีทับ (ช่วงปี)
    if (value.contains('/')) {
      final parts = value.split('/');
      if (parts.length == 2) {
        final startAd = int.tryParse(parts[0]);
        if (startAd != null) {
          // แปลงท่อนหลัง (อาจเป็น 26 หรือ 2026)
          int? endAd;
          final tail = parts[1].trim();
          if (tail.length == 2) {
            // สร้างปี ค.ศ. เต็ม โดยอิงศตวรรษเดียวกับ startAd
            final century = (startAd ~/ 100) * 100; // 2000
            endAd = century + (int.tryParse(tail) ?? 0); // 2026
          } else {
            endAd = int.tryParse(tail);
          }
          final startBe = startAd + 543;
          final endBe = (endAd ?? (startAd + 1)) + 543;
          return showRange ? 'ปีการศึกษา $startBe/$endBe' : 'ปีการศึกษา $startBe';
        }
      }
    }

    // ถ้าเป็นปีเดียว
    final asNum = int.tryParse(value);
    if (asNum != null) {
      // ถ้าเป็น พ.ศ. อยู่แล้ว (>= 2400) ให้คงไว้
      if (asNum >= 2400) return 'ปีการศึกษา $asNum';
      // ไม่งั้นแปลง ค.ศ. -> พ.ศ.
      return 'ปีการศึกษา ${asNum + 543}';
    }

    // รูปแบบอื่น ๆ คงค่าเดิม
    return 'ปีการศึกษา $value';
  }

  // --------- Fetch ----------
  Future<void> _fetchData() async {
    if (_msId == null || _msId!.isEmpty) {
      setState(() => _error = 'MS ID ไม่ถูกต้อง/ยังไม่ได้ล็อกอิน');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final yearF = _apiService.getYearSummary(_msId!);
      final sixF  = _apiService.getSixMonthSummary(_msId!);
      final allF  = _apiService.getTotalHours(_msId!);

      final results = await Future.wait([yearF, sixF, allF]);

      setState(() {
        _yearData     = results[0] as List<HoursSummary>;
        _sixMonthData = results[1] as List<HoursSummary>;
        _totalHours   = results[2] as double;
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // --------- Reusable UI ----------
  Widget _emptyState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Color.fromARGB(255, 127, 58, 237), Color(0xFF6D28D9)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.purple.withOpacity(0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: const Icon(Icons.hourglass_empty, color: Colors.white, size: 36),
            ),
            const SizedBox(height: 14),
            Text(
              message,
              style: TextStyle(color: Colors.purple.shade400, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statChip({required IconData icon, required String label, required String value}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F3FF),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFEDE9FE)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: const Color(0xFF7C3AED), size: 18),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(color: Color(0xFF6B21A8))),
          const SizedBox(width: 6),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4C1D95))),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title, {IconData icon = Icons.insights}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [Color.fromARGB(255, 124, 54, 182), Color.fromARGB(255, 99, 32, 153)]),
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white),
          const SizedBox(width: 10),
          Text(
            title,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
          ),
        ],
      ),
    );
  }

  // --------- Tabs ----------
  Widget _buildSixMonthTab() {
    if (_sixMonthData.isEmpty) return _emptyState('ยังไม่มีข้อมูล 6 เดือนย้อนหลัง');

    // สรุปยอด
    final sum = _sixMonthData.fold<double>(0.0, (a, b) => a + b.totalHours);
    final avg = sum / _sixMonthData.length;

    return Column(
      children: [
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _statChip(icon: Icons.schedule, label: 'รวม 6 เดือน', value: '${sum.toStringAsFixed(2)} ชม.'),
            _statChip(icon: Icons.show_chart, label: 'เฉลี่ย', value: '${avg.toStringAsFixed(2)} ชม.'),
          ],
        ),
        const SizedBox(height: 12),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: _sixMonthData.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final item = _sixMonthData[index];
              return Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.purple.withOpacity(0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                  border: Border.all(color: const Color(0xFFEDE9FE)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionHeader('6 เดือนย้อนหลัง', icon: Icons.timeline),
                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          Container(
                            height: 44,
                            width: 44,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [Color.fromARGB(255, 122, 54, 179), Color.fromARGB(255, 106, 33, 175)],
                              ),
                            ),
                            child: const Icon(Icons.calendar_month, color: Colors.white),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  formatAcademicYearThai(item.academicYear, showRange: true),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF4C1D95),
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.timer, size: 16, color: Color(0xFF6B21A8)),
                                    const SizedBox(width: 6),
                                    Text(
                                      'ชั่วโมงสะสม: ${item.totalHours.toStringAsFixed(2)} ชม.',
                                      style: const TextStyle(color: Color(0xFF6B21A8)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Progress แสดงสัดส่วนต่อเป้าหมาย
                    Padding(
                      padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          LinearProgressIndicator(
                            value: (_targetHours == 0) ? 0 : (item.totalHours / _targetHours).clamp(0.0, 1.0),
                            minHeight: 8,
                            color: const Color(0xFF7C3AED),
                            backgroundColor: const Color(0xFFF3E8FF),
                          ),
                          const SizedBox(height: 6),
                          
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildYearTab() {
    if (_yearData.isEmpty) return _emptyState('ยังไม่มีข้อมูลรายปี');

    final sum = _yearData.fold<double>(0.0, (a, b) => a + b.totalHours);
    final best = _yearData.reduce((a, b) => a.totalHours >= b.totalHours ? a : b);

    return Column(
      children: [
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _statChip(icon: Icons.workspace_premium, label: 'รวมรายปี', value: '${sum.toStringAsFixed(2)} ชม.'),
            _statChip(icon: Icons.star, label: 'สูงสุด', value: '${best.totalHours.toStringAsFixed(2)} ชม.'),
          ],
        ),
        const SizedBox(height: 12),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: _yearData.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final item = _yearData[index];
              return Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.purple.withOpacity(0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 6),
                    ),
                  ],
                  border: Border.all(color: const Color(0xFFEDE9FE)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _sectionHeader('ปีการศึกษา', icon: Icons.school),
                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          Container(
                            height: 44,
                            width: 44,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: const LinearGradient(
                                colors: [Color.fromARGB(255, 100, 34, 155), Color.fromARGB(255, 92, 30, 150)],
                              ),
                            ),
                            child: const Icon(Icons.school, color: Colors.white),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  // สำหรับรายปี ปกติใช้ปีเดียว → showRange: false
                                  formatAcademicYearThai(item.academicYear, showRange: false),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Color.fromARGB(255, 95, 29, 149),
                                    fontSize: 16,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    const Icon(Icons.timer, size: 16, color: Color.fromARGB(255, 114, 33, 168)),
                                    const SizedBox(width: 6),
                                    Text(
                                      'ชั่วโมงรวม: ${item.totalHours.toStringAsFixed(2)} ชม.',
                                      style: const TextStyle(color: Color(0xFF6B21A8)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          LinearProgressIndicator(
                            value: (_targetHours == 0) ? 0 : (item.totalHours / _targetHours).clamp(0.0, 1.0),
                            minHeight: 8,
                            color: const Color(0xFF7C3AED),
                            backgroundColor: const Color(0xFFF3E8FF),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'เป้าหมาย $_targetHours ชม.',
                            style: const TextStyle(color: Color(0xFF7E22CE), fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildAllTab() {
    final pct = (_targetHours == 0) ? 0.0 : (_totalHours / _targetHours).clamp(0.0, 1.0);

    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Banner รวมสวย ๆ
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color.fromARGB(255, 130, 65, 190), Color.fromARGB(255, 107, 31, 179)],
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.purple.withOpacity(0.25),
                  blurRadius: 18,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              children: [
                const Text(
                  'รวมชั่วโมงกิจกรรมทั้งหมด',
                  style: TextStyle(color: Colors.white70, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 6),
                Text(
                  '${_totalHours.toStringAsFixed(2)} ชม.',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 32,
                  ),
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: pct,
                    minHeight: 10,
                    color: Colors.white,
                    backgroundColor: Colors.white24,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'ความคืบหน้าเป้าหมาย $_targetHours ชม.',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // สรุปแยกหมวด
          Row(
            children: [
              Expanded(
                child: _summaryTile(
                  icon: Icons.check_circle,
                  title: 'ค่าเฉลี่ย/ปี',
                  value: _yearData.isEmpty
                      ? '-'
                      : '${(_totalHours / _yearData.length).toStringAsFixed(2)} ชม.',
                  color: const Color(0xFF7C3AED),
                ),
              ),
              const SizedBox(width: 12),
              
            ],
          ),
          const SizedBox(height: 12),

          Expanded(
            child: _yearData.isEmpty
                ? _emptyState('ยังไม่มีข้อมูลรวมที่สรุปได้')
                : ListView.separated(
                    padding: const EdgeInsets.only(top: 8),
                    itemCount: _yearData.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final y = _yearData[index];
                      return ListTile(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                          side: const BorderSide(color: Color(0xFFEDE9FE)),
                        ),
                        tileColor: Colors.white,
                        leading: CircleAvatar(
                          backgroundColor: const Color(0xFFF3E8FF),
                          child: const Icon(Icons.school, color: Color.fromARGB(255, 115, 43, 184)),
                        ),
                        title: Text(
                          formatAcademicYearThai(y.academicYear, showRange: false),
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF4C1D95),
                          ),
                        ),
                        subtitle: Text('ชั่วโมงรวม: ${y.totalHours.toStringAsFixed(2)} ชม.'),
                        
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _summaryTile({required IconData icon, required String title, required String value, required Color color}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFEDE9FE)),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.purple.withOpacity(0.08),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFFF3E8FF),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(title, style: const TextStyle(color: Color(0xFF6B21A8))),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4C1D95)),
          ),
        ],
      ),
    );
  }

  // --------- Scaffold ----------
  @override
  Widget build(BuildContext context) {
    final purple = const Color.fromARGB(255, 107, 67, 177);

    return Scaffold(
      backgroundColor: const Color(0xFFF8F7FF),
      appBar: AppBar(
        title: const Text('ชั่วโมงกิจกรรมสะสม'
            , style: TextStyle(color: Color.fromARGB(255, 255, 255, 255),)),
        elevation: 0,
        centerTitle: true,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(colors: [Color.fromARGB(255, 116, 52, 175), Color.fromARGB(255, 120, 44, 182)]),
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: '6 เดือน'),
            Tab(text: 'รายปี'),
            Tab(text: 'รวม'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF7C3AED)))
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, color: purple, size: 40),
                        const SizedBox(height: 10),
                        Text('เกิดข้อผิดพลาด', style: TextStyle(color: purple, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 6),
                        Text('$_error', textAlign: TextAlign.center, style: const TextStyle(color: Colors.black54)),
                        const SizedBox(height: 10),
                        ElevatedButton.icon(
                          onPressed: _fetchData,
                          icon: const Icon(Icons.refresh),
                          label: const Text('ลองใหม่'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: purple,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildSixMonthTab(),
                    _buildYearTab(),
                    _buildAllTab(),
                  ],
                ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
