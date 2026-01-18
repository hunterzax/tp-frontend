#!/usr/bin/env python3
"""
Comprehensive script to check and analyze all null pointer issues
from the CSV file and identify specific fixes needed.
"""

import csv
import os
from typing import List, Dict, Tuple

def read_csv_issues(filename: str) -> List[Dict]:
    """Read issues from CSV file"""
    issues = []
    with open(filename, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            issues.append(row)
    return issues

def check_file_exists(filepath: str) -> bool:
    """Check if a file exists in the project"""
    full_path = os.path.join('/Users/zax/Documents/Project_TPA_SCAN/VA146/TPA-FRONT-END', filepath.lstrip('/'))
    return os.path.exists(full_path)

def get_file_lines(filepath: str, start_line: int, end_line: int = None) -> List[str]:
    """Get specific lines from a file"""
    if end_line is None:
        end_line = start_line
    
    full_path = os.path.join('/Users/zax/Documents/Project_TPA_SCAN/VA146/TPA-FRONT-END', filepath.lstrip('/'))
    
    if not os.path.exists(full_path):
        return []
    
    try:
        with open(full_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            # Get target lines (accounting for 1-based line numbers in CSV)
            result = []
            for i in range(max(0, start_line-3), min(len(lines), start_line+2)):
                result.append(f"Line {i+1}: {lines[i].rstrip()}")
            return result
    except Exception:
        return []

def analyze_null_pointer_issues(csv_issues: List[Dict]) -> Dict:
    """Analyze all null pointer issues"""
    analysis = {
        'existing_files': [],
        'missing_files': [],
        'by_file': {},
        'by_type': {},
        'total_issues': len(csv_issues)
    }
    
    for issue in csv_issues:
        file_path = issue['File']
        line_num = int(issue['Line']) if issue['Line'].isdigit() else 0
        issue_type = issue['Type']
        
        if check_file_exists(file_path):
            analysis['existing_files'].append(issue)
            
            if file_path not in analysis['by_file']:
                analysis['by_file'][file_path] = []
            analysis['by_file'][file_path].append(issue)
            
            if issue_type not in analysis['by_type']:
                analysis['by_type'][issue_type] = 0
            analysis['by_type'][issue_type] += 1
        else:
            analysis['missing_files'].append(issue)
    
    return analysis

def generate_detailed_report(analysis: Dict):
    """Generate a detailed report of the analysis"""
    print("="*80)
    print("DETAILED NULL POINTER (CWE-476) ANALYSIS REPORT")
    print("="*80)
    print(f"Total Issues: {analysis['total_issues']}")
    print(f"Existing Files: {len(analysis['existing_files'])}")
    print(f"Missing Files: {len(analysis['missing_files'])}")
    print()
    
    print("ISSUE TYPE DISTRIBUTION:")
    print("-" * 40)
    for issue_type, count in sorted(analysis['by_type'].items(), key=lambda x: x[1], reverse=True):
        print(f"{count:3d} - {issue_type}")
    print()
    
    print("TOP FILES WITH MOST ISSUES:")
    print("-" * 40)
    file_issues = [(file_path, len(issues)) for file_path, issues in analysis['by_file'].items()]
    file_issues.sort(key=lambda x: x[1], reverse=True)
    
    for file_path, count in file_issues[:20]:  # Top 20
        print(f"{count:2d} - {file_path}")
    print()
    
    # Show some specific examples with context
    print("SAMPLE ISSUES WITH CONTEXT:")
    print("-" * 40)
    count = 0
    for file_path, issues in analysis['by_file'].items():
        if count >= 5:  # Show only first 5 for brevity
            break
        for issue in issues[:1]:  # Show only first issue per file
            line_num = int(issue['Line']) if issue['Line'].isdigit() else 0
            lines = get_file_lines(file_path, line_num)
            print(f"\nFile: {file_path} | Line: {line_num} | Type: {issue['Type']}")
            for line in lines:
                marker = " >>> " if f"Line {line_num}:" in line else "     "
                print(f"{marker}{line}")
            count += 1
            if count >= 5:
                break
        if count >= 5:
            break

def main():
    print("Analyzing all null pointer issues from CSV file...")
    
    # Read all issues from the CSV
    csv_path = "/Users/zax/Documents/Project_TPA_SCAN/VA146/TPA-FRONT-END/CWE-476_NULL_Pointer_REAL_correct.csv"
    issues = read_csv_issues(csv_path)
    
    print(f"Found {len(issues)} issues in the CSV file")
    
    # Analyze the issues
    analysis = analyze_null_pointer_issues(issues)
    
    # Generate detailed report
    generate_detailed_report(analysis)
    
    # Also save a summary to a file
    summary_path = "/Users/zax/Documents/Project_TPA_SCAN/VA146/TPA-FRONT-END/null_pointer_analysis_summary.txt"
    with open(summary_path, 'w') as f:
        f.write("NULL POINTER ANALYSIS SUMMARY\n")
        f.write("="*50 + "\n")
        f.write(f"Total Issues: {analysis['total_issues']}\n")
        f.write(f"Existing Files: {len(analysis['existing_files'])}\n")
        f.write(f"Missing Files: {len(analysis['missing_files'])}\n")
        f.write("\nTop 10 Files by Issue Count:\n")
        
        file_issues = [(file_path, len(issues)) for file_path, issues in analysis['by_file'].items()]
        file_issues.sort(key=lambda x: x[1], reverse=True)
        
        for file_path, count in file_issues[:10]:
            f.write(f"  {count:2d} - {file_path}\n")

if __name__ == "__main__":
    main()