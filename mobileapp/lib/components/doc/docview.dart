import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/record_api.dart';
import './docdetial.dart';
import 'package:mobileapp/models/record.dart';
import '../../providers/user_provider.dart';

enum SortOption { newest, oldest }

class Docview extends StatefulWidget {
  const Docview({super.key});

  @override
  State<Docview> createState() => _DocviewState();
}

class _DocviewState extends State<Docview> {
  late Future<List<Registration>> _registrationsFuture;
  SortOption _sortOption = SortOption.newest;

  @override
  void initState() {
    super.initState();
    _fetchRegistrations();
  }

  void _fetchRegistrations() {
    final user = Provider.of<UserProvider>(context, listen: false).user;
    final studentId = user?.msId ?? '64222040'; 
    print('Fetching registrations for studentId: $studentId');
    _registrationsFuture = ApiService().getRegistrationByStudentId(studentId);
  }

  // Function for sorting registrations based on the selected sort option
  List<Registration> _sortRegistrations(List<Registration> registrations) {
    return registrations
      ..sort((a, b) {
        // Handle cases where event or postDate might be null
        final dateA = a.event?.postDate != null ? DateTime.tryParse(a.event!.postDate) : DateTime(0);
        final dateB = b.event?.postDate != null ? DateTime.tryParse(b.event!.postDate) : DateTime(0);
        
        switch (_sortOption) {
          case SortOption.newest:
            return dateB!.compareTo(dateA!); // Newest first
          case SortOption.oldest:
            return dateA!.compareTo(dateB!); // Oldest first
        }
      });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<UserProvider>(context).user;
    if (user == null) {
      return const Scaffold(
        body: Center(child: Text('No user logged in. Please log in.')),
      );
    }

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() {
            _fetchRegistrations(); // Refresh data
          });
        },
        child: Column(
          children: [
            // Original header (unchanged)
            Container(
              margin: const EdgeInsets.fromLTRB(16.0, 15.0, 16.0, 16.0),
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: const Color.fromARGB(255, 94, 32, 142),
                borderRadius: BorderRadius.circular(12.0),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey,
                    spreadRadius: 2,
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'การเข้าร่วมกิจกรรม',
                          style: TextStyle(
                            color: Color.fromARGB(255, 255, 255, 255),
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'กิจกรรมที่เข้าร่วมไปแล้ว',
                          style: TextStyle(
                            fontSize: 14,
                            color: Color.fromARGB(255, 255, 255, 255),
                          ),
                        ),
                        const SizedBox(height: 12),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>ActivityMoreDetail(), 
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 10,
                            ),
                          ),
                          child: const Text('ดูเพิ่มเติม'),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 100,
                    height: 100,
                    margin: const EdgeInsets.only(left: 12.0),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8.0),
                      image: const DecorationImage(
                        image: AssetImage('assets/images/post.png'),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // New heading: ประวัติการลงทะเบียนกิจกรรม
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'ประวัติการลงทะเบียนกิจกรรม',
                  style: TextStyle(
                    fontFamily: 'Sarabun',
                    fontSize: 18,
                    
                  ),
                ),
              ),
            ),
           
            
            // Registration list
            Expanded(
              child: FutureBuilder<List<Registration>>(
                future: _registrationsFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Center(child: Text('No registration history found.'));
                  }

                  final registrations = _sortRegistrations(snapshot.data!);
                  return ListView.builder(
                    itemCount: registrations.length,
                    itemBuilder: (context, index) {
                      final registration = registrations[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                        child: ListTile(
                          leading: const Icon(Icons.event),
                          
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                             
                              if (registration.event != null) ...[
                                Text(
                                  ' ${registration.event!.postContent.length > 50 ? '${registration.event!.postContent.substring(0, 18)}...' : registration.event!.postContent}',
                                  style: const TextStyle(fontFamily: 'Sarabun', fontSize: 14),
                                ),
                                Text(
                                  'Location: ${registration.event!.postlocation}',
                                  style: const TextStyle(fontFamily: 'Sarabun', fontSize: 14),
                                ),
                               
                                Text(
                                  'Date: ${registration.event!.formatDate(registration.event!.postDate)}',
                                  style: const TextStyle(fontFamily: 'Sarabun', fontSize: 14),
                                ),
                              ],
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
      ),
    );
  }
}