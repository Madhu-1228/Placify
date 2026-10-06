import requests
import json
import sys

BASE_URL = "http://localhost:8080/api"

def create_minimal_pdf(lines):
    content = "BT\n/F1 12 Tf\n16 TL\n50 720 Td\n"
    for line in lines:
        clean_line = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
        content += f"({clean_line}) '\n"
    content += "ET\n"
    stream_bytes = content.encode('latin-1')
    stream_len = len(stream_bytes)

    header = b"%PDF-1.4\n"
    obj1 = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    obj2 = b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    obj3 = b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
    obj4_head = f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode('latin-1')
    obj4_tail = b"\nendstream\nendobj\n"
    obj5 = b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"

    offsets = []
    current_offset = len(header)

    offsets.append(current_offset)
    current_offset += len(obj1)

    offsets.append(current_offset)
    current_offset += len(obj2)

    offsets.append(current_offset)
    current_offset += len(obj3)

    offsets.append(current_offset)
    current_offset += len(obj4_head) + stream_len + len(obj4_tail)

    offsets.append(current_offset)
    current_offset += len(obj5)

    xref_offset = current_offset
    xref = f"xref\n0 6\n0000000000 65535 f \n".encode('latin-1')
    for off in offsets:
        xref += f"{off:010d} 00000 n \n".encode('latin-1')

    trailer = f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode('latin-1')

    return header + obj1 + obj2 + obj3 + obj4_head + stream_bytes + obj4_tail + obj5 + xref + trailer

def login(username, password):
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": username, "password": password})
    if resp.status_code == 200:
        res_json = resp.json()
        data = res_json.get("data") or res_json
        token = data.get("token") or data.get("accessToken")
        print(f"[*] Logged in as {username}, got token (length {len(token)})")
        return token
    else:
        print(f"[!] Login failed: {resp.status_code} {resp.text}")
        sys.exit(1)

def test_analyze(token, filename, lines, expected_valid, description):
    print(f"\n--- Testing: {description} ({filename}) ---")
    pdf_bytes = create_minimal_pdf(lines)
    
    files = {
        'file': (filename, pdf_bytes, 'application/pdf')
    }
    data = {
        'targetSkills': 'Java,React,Spring Boot'
    }
    headers = {
        'Authorization': f'Bearer {token}'
    }

    resp = requests.post(f"{BASE_URL}/resume/analyze", files=files, data=data, headers=headers)
    
    if expected_valid:
        if resp.status_code == 200:
            raw_json = resp.json()
            res_json = raw_json.get("data") or raw_json
            is_resume = res_json.get("isResume", True)
            overall_score = res_json.get("overallScore", 0)
            ats_score = res_json.get("atsScore", 0)
            print(f"[PASS] Document accepted as valid resume.")
            print(f"       Scores -> Overall: {overall_score}, ATS: {ats_score}")
            print(f"       Verdict: {res_json.get('readinessVerdict')}")
            print(f"       Detected Skills: {res_json.get('detectedSkills')}")
            assert is_resume is True, "Expected isResume to be True"
            assert overall_score > 0, "Expected overallScore > 0"
            return True, res_json
        else:
            print(f"[FAIL] Expected PASS but got status {resp.status_code}: {resp.text}")
            return False, None
    else:
        if resp.status_code == 400:
            res_json = resp.json()
            err_msg = res_json.get("message", "")
            print(f"[PASS] Non-resume correctly REJECTED with 400 Bad Request.")
            print(f"       Rejection Message: {err_msg}")
            assert "overallScore" not in res_json
            return True, err_msg
        elif resp.status_code == 200:
            res_json = resp.json()
            if res_json.get("isResume") is False or res_json.get("overallScore") == 0:
                print(f"[PASS] Document returned isResume=false and 0 score.")
                return True, res_json
            else:
                print(f"[FAIL] Expected REJECTION but document was accepted with score: {res_json.get('overallScore')}")
                return False, res_json
        else:
            print(f"[!] Got status {resp.status_code}: {resp.text}")
            return False, None

def main():
    print("=================================================================")
    print("PLACIFY RESUME ANALYZER VALIDATION VERIFICATION SUITE")
    print("=================================================================")

    token = login("23BQ1A1228@vvit.net", "Madhu@300526")

    # TEST 1: Real Student Resume
    test_1_lines = [
        "Devanaboyina Madhu",
        "Email: 23bq1a1228@vvit.net | Phone: +91 9876543210 | LinkedIn: linkedin.com/in/madhud",
        "Education: B.Tech in Information Technology, VVIT (2023 - 2027) | CGPA: 8.85",
        "Technical Skills: Java, Spring Boot, Microservices, MongoDB, MySQL, Docker, React, REST API, Git",
        "Projects: PLACIFY - AI Powered Campus Recruitment System using React and Spring Boot",
        "Experience: Software Engineering Intern at Tech Innovators (6 months)",
        "Certifications: Oracle Certified Java SE 11 Developer, AWS Cloud Practitioner"
    ]
    ok_1, _ = test_analyze(token, "Madhu_Real_Resume.pdf", test_1_lines, True, "Test 1: Real Student Resume")

    # TEST 2: Semester Results PDF
    test_2_lines = [
        "VASCO INSTITUTE OF TECHNOLOGY",
        "SEMESTER RESULTS - B.TECH III YEAR I SEMESTER REGULAR EXAMINATIONS",
        "Hall Ticket No: 23BQ1A1228 | Student Name: Devanaboyina Madhu",
        "Course Code | Course Title | Credits | Letter Grade | Grade Points",
        "23CS501 | Operating Systems | 3.0 | O | 10",
        "23CS502 | Computer Networks | 3.0 | A+ | 9",
        "23CS503 | Database Management Systems | 3.0 | A | 8",
        "23CS504 | Design and Analysis of Algorithms | 3.0 | A+ | 9",
        "SGPA: 9.00 | CGPA: 8.85 | Result: PASSED",
        "Controller of Examinations"
    ]
    ok_2, _ = test_analyze(token, "Semester_Results_Nov2025.pdf", test_2_lines, False, "Test 2: Semester Results PDF")

    # TEST 3: Consolidated Marks Memo
    test_3_lines = [
        "VASCO UNIVERSITY OF TECHNOLOGY",
        "CONSOLIDATED SEMESTER MARKS MEMORANDUM",
        "Statement of Marks / Semester Grade Report",
        "Roll No: 23BQ1A1228 | Student Name: Devanaboyina Madhu",
        "Subject Code 101: Engineering Mathematics III - Internal: 28 | External: 57 | Total: 85 | Grade: A",
        "Subject Code 102: Data Structures and Algorithms - Internal: 29 | External: 63 | Total: 92 | Grade: A+",
        "Total Credits Earned: 24 | SGPA: 8.80 | Cumulative CGPA: 8.85",
        "Result: PASSED IN FIRST CLASS WITH DISTINCTION"
    ]
    ok_3, _ = test_analyze(token, "Consolidated_Marks_Memo.pdf", test_3_lines, False, "Test 3: Consolidated Marks Memo")

    # TEST 4: Academic Transcript PDF
    test_4_lines = [
        "OFFICIAL ACADEMIC TRANSCRIPT",
        "Office of the Registrar & Academic Affairs",
        "Student Name: John Smith | Roll No: 2021BCSE045",
        "Degree: Bachelor of Technology in Computer Science",
        "Semester I Total Credits: 22 | SGPA: 8.20",
        "Semester II Total Credits: 24 | SGPA: 8.50",
        "Semester III Total Credits: 24 | SGPA: 8.90",
        "Semester IV Total Credits: 22 | SGPA: 8.70",
        "Cumulative Grade Point Average (CGPA): 8.58",
        "Registrar Signature"
    ]
    ok_4, _ = test_analyze(token, "Official_Transcript.pdf", test_4_lines, False, "Test 4: Academic Transcript PDF")

    # TEST 5: AWS / Cloud Certificate PDF
    test_5_lines = [
        "Amazon Web Services Training and Certification",
        "Certificate of Completion",
        "This is to certify that Devanaboyina Madhu has successfully completed the online course",
        "AWS Certified Solutions Architect Associate",
        "Issue Date: August 15, 2025",
        "Credential ID: AWS-8921389-CERT",
        "Authorized Signatory: Werner Vogels, CTO Amazon.com"
    ]
    ok_5, _ = test_analyze(token, "AWS_Certificate.pdf", test_5_lines, False, "Test 5: AWS Cloud Certificate PDF")

    # TEST 6: Project Report PDF
    test_6_lines = [
        "A PROJECT REPORT ON",
        "SMART CAMPUS PLACEMENT MANAGEMENT SYSTEM",
        "Submitted in partial fulfillment of the requirements for B.Tech in Computer Science",
        "Under the guidance of Dr. K. Rama Krishna, Professor",
        "Department of Computer Science and Engineering",
        "Table of Contents",
        "Chapter 1: Introduction",
        "Chapter 2: Literature Survey",
        "Chapter 3: System Architecture Diagram",
        "Chapter 4: Implementation and Experimental Results",
        "Guide Signature    Head of the Department"
    ]
    ok_6, _ = test_analyze(token, "Placement_Project_Report.pdf", test_6_lines, False, "Test 6: Project Report PDF")

    # TEST 7: Question Paper PDF
    test_7_lines = [
        "JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY",
        "III B.Tech II Semester Regular Examinations, April 2026",
        "DATA STRUCTURES AND ALGORITHMS - QUESTION PAPER",
        "Time: 3 Hours    Max Marks: 70",
        "Answer any FIVE Questions. All questions carry equal marks.",
        "Q.1 Explain the difference between B-Tree and B+ Tree with diagrams. (14M)",
        "Q.2 Write an algorithm for Dijkstra's Single Source Shortest Path. (14M)",
        "Q.3 Describe Quick Sort time complexity in best, average and worst case. (14M)"
    ]
    ok_7, _ = test_analyze(token, "Mid2_Question_Paper.pdf", test_7_lines, False, "Test 7: Question Paper PDF")

    # TEST 8: Generic Research Paper / Article PDF
    test_8_lines = [
        "THE FUTURE OF ARTIFICIAL INTELLIGENCE IN HEALTHCARE",
        "By Dr. Alan Turing, Department of Computer Science",
        "Abstract: In this paper we discuss the transformative role of deep learning in modern diagnostic systems.",
        "Healthcare providers worldwide are adopting automated radiological scanning techniques to detect anomalies early.",
        "While computational models have achieved impressive accuracy, challenges regarding data privacy remain prevalent.",
        "Conclusion: Continued interdisciplinary collaboration is essential for safe clinical deployment."
    ]
    ok_8, _ = test_analyze(token, "AI_Healthcare_Paper.pdf", test_8_lines, False, "Test 8: Generic Research Paper PDF")

    # TEST 9: Invoice / Billing PDF
    test_9_lines = [
        "TAX INVOICE / PAYMENT RECEIPT",
        "Invoice Number: INV-2026-9812",
        "Bill To: Customer Services Inc.",
        "Item: Cloud Hosting Services (1 Year) - $120.00",
        "Item: Domain Registration - $15.00",
        "Subtotal: $135.00 | Tax: $15.00 | Total Amount Paid: $150.00",
        "Thank you for your business!"
    ]
    ok_9, _ = test_analyze(token, "Cloud_Bill_Receipt.pdf", test_9_lines, False, "Test 9: Invoice / Billing PDF")

    # TEST 10: Valid Fresher Resume
    test_10_lines = [
        "Jane Doe",
        "Email: jane.doe@gmail.com | Phone: 9848012345 | GitHub: github.com/janedoe",
        "Career Objective: Aspiring AI/ML Engineer seeking opportunities in deep learning.",
        "Education: B.Tech in Artificial Intelligence, VVIT (2023 - 2027) | CGPA: 9.10",
        "Technical Skills: Python, PyTorch, TensorFlow, Machine Learning, Deep Learning, Pandas, NumPy, SQL",
        "Projects: Image Classification CNN with PyTorch (96 percent accuracy)",
        "Projects: Automated Speech Recognition pipeline using Whisper and FastAPI"
    ]
    ok_10, _ = test_analyze(token, "Jane_Fresher_Resume.pdf", test_10_lines, True, "Test 10: Valid Fresher Resume")

    # TEST 11: Critical Stale-State Test (Resume -> Non-Resume PDF -> Resume)
    print("\n--- Testing: Test 11 (Critical Stale-State Sequence: Resume -> Non-Resume PDF -> Resume) ---")
    ok_11a, _ = test_analyze(token, "Madhu_Valid_Resume.pdf", test_1_lines, True, "Test 11a: Upload valid resume (expect score)")
    ok_11b, _ = test_analyze(token, "Semester_Results_Nov2025.pdf", test_2_lines, False, "Test 11b: Upload semester PDF (expect error, score reset)")
    ok_11c, _ = test_analyze(token, "Madhu_Valid_Resume.pdf", test_1_lines, True, "Test 11c: Re-upload valid resume (expect score restored)")

    all_passed = all([ok_1, ok_2, ok_3, ok_4, ok_5, ok_6, ok_7, ok_8, ok_9, ok_10, ok_11a, ok_11b, ok_11c])
    print("\n=================================================================")
    if all_passed:
        print("ALL VERIFICATION SUITE TESTS PASSED! ZERO ATS LEAKAGE CONFIRMED.")
    else:
        print("SOME TESTS FAILED. PLEASE CHECK THE LOGS.")
    print("=================================================================")

if __name__ == '__main__':
    main()
