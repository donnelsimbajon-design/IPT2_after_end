import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DEFAULT_COURSES = [
  'AB-C BACHELOR OF ARTS MAJOR IN COMMUNICATION',
  'AB-CA BACHELOR OF ARTS - MAJOR IN COMMUNICATION ARTS',
  'AB-ECON - BACHELOR OF ARTS MAJOR IN ECONOMICS',
  'AB-ELS BACHELOR OF ARTS IN ENGLISH LANGUAGE STUDIES',
  'AB-ENGLANG - BACHELOR OF ARTS - MAJOR IN ENGLISH LANGUAGE',
  'AB-FILLANG - BACHELOR OF ARTS - FILIPINO LANGUAGE',
  'AB-GC BACHELOR OF ARTS MAJOR IN GUIDANCE AND COUNSELING',
  'AB-HISTORY - BACHELOR OF ARTS IN HISTORY',
  'AB-MC BACHELOR OF ARTS MASS COMMUNICATION',
  'BACHELOR OF ARTS MAJOR IN POLITICAL SCIENCE AB-PS',
  'ACAD-ABM-ABP-ACADEMIC ABM-ABP MORELOS ACCOUNTANCY BUSINESS AND MANAGEMENT STRAND',
  'ACAD-ABM-BPP ACADEMIC ABM-BP PUEBLOS ACCOUNTANCY BUSINESS AND MANAGEMENT STRAND',
  'ACAD-GAS-ABP-ACADEMIC GAS-ABP MORELOS GENERAL ACADEMIC STRAND',
  'ACAD-GAS-BPP ACADEMIC GAS-BP PUEBLOS GENERAL ACADEMIC STRAND',
  'ACAD-HUMSS-ABP-ACADEMIC HUMSS-ABP MORELOS - HUMANITIES AND SOCIAL SCIENCES STRAND',
  'ACAD-HUMSS-BPP - ACADEMIC HUMSS-BP PUEBLOS - HUMANITIES AND SOCIAL SCIENCES STRAND',
  'ACAD-STEM-ABP-ACADEMIC STEM-ABP MORELOS - SCIENCE, TECHNOLOGY, ENGINEERING, AND MATHEMATICS STRAND',
  'ACAD-STEM-BPP - ACADEMIC STEM-BP PUEBLOS - SCIENCE, TECHNOLOGY, ENGINEERING, AND MATHEMATICS STRAND',
  'ACAD-STEM-ABP-ACADEMIC STEM-ABP MORELOS - SCIENCE, TECHNOLOGY, ENGINEERING, AND MATHEMATICS STRAND',
  'ACAD-STEM-BPP - ACADEMIC STEM-BP PUEBLOS - SCIENCE, TECHNOLOGY, ENGINEERING, AND MATHEMATICS STRAND',
  'AT Automotive Technology',
  'ATC1 Automotive Technology-Clustered (One Year)',
  'AUDIT_ACC AUDIT UNDERGRADUATE_ACCOUNTANCY',
  'BECE',
  'BACHELOR OF EARLY CHILDHOOD EDUCATION',
  'BECED',
  'BACHELOR OF EARLY CHILDHOOD EDUCATION',
  'BEE',
  'BACHELOR OF ELEMENTARY EDUCATION (WITH SPECIALIZATION IN SPECIAL EDUCATION)',
  'BEE-PRES.ED. - BACHELOR OF ELEMENTARY EDUCATION (WITH SPECIALIZATION IN PRE-SCHOOL EDUCATION)',
  'BEED',
  'BACHELOR OF ELEMENTARY EDUCATION',
  'BEEG',
  'BACHELOR OF ELEMENTARY EDUCATION',
  'BEESE',
  'BEEPE BACHELOR OF ELEMENTARY EDUCATION (WITH SPECIALIZATION IN PRESCHOOL EDUCATION)',
  'BACHELOR OF ELEMENTARY EDUCATION SPECIALIZATION IN SPECIAL EDUCATION',
  'BLIS',
  'BHUMSERV BACHELOR IN HUMAN SERVICES',
  'BACHELOR OF LIBRARY AND INFORMATION SCIENCE',
  'BPA',
  'BACHELOR OF PUBLIC ADMINISTRATION',
  'BPE',
  'BACHELOR OF PHYSICAL EDUCATION MAJOR IN SCHOOL P.E..',
  'BS PSYCH',
  'BPED BACHELOR OF PHYSICAL EDUCATION',
  'BACHELOR OF SCIENCE IN PSYCHOLOGY',
  'BSA BACHELOR OF SCIENCE IN ACCOUNTANCY',
  'BSAAM BACHELOR OF SCIENCE IN ACCOUNTANCY MAJOR IN ACCOUNTING MANAGEMENT',
  'BSAIS BACHELOR OF SCIENCE IN ACCOUNTING INFORMATION SYSTEM',
  'BSAM BACHELOR OF SCIENCE IN APPLIED MATHEMATICS',
  'BSAT BACHELOR OF SCIENCE IN ACCOUNTING TECHNOLOGY',
  'BSBA-FM BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION - MAJOR IN FINANCIAL MANAGEMENT',
  'BSBA-HRDM BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION MAJOR IN HUMAN RESOURCE DEVELOPMENT MANAGEMENT',
  'BSBA-HRMGT BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION - MAJOR IN HUMAN RESOURCE MANAGEMENT',
  'BSBA-MM - BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION MAJOR IN MARKETING MANAGEMENT',
  'BSBA-OM BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION MAJOR IN OPERATIONS MANAGEMENT',
  'BACHELOR OF SCIENCE IN BIOLOGY BSBIO',
  'BSC-ACM BACHELOR OF SCIENCE IN COMMERCE MAJOR IN ACCOUNTING MANAGEMENT',
  'BSC-BIS BACHELOR OF SCIENCE IN COMMERCE - MAJOR IN BUSINESS INFORMATION SYSTEM',
  'BSC-F BACHELOR OF SCIENCE IN COMMERCE - MAJOR IN FINANCE',
  'BSC-LM BACHELOR OF SCIENCE IN COMMERCE MAJOR IN LEGAL MANAGEMENT',
  'BSC-MK BACHELOR OF SCIENCE IN COMMERCE MAJOR IN MARKETING',
  'BSC-MN BACHELOR OF SCIENCE IN COMMERCE - MAJOR IN MANAGEMENT',
  'BSCE BACHELOR OF SCIENCE IN CIVIL ENGINEERING',
  'BSCRIM BACHELOR OF SCIENCE IN CRIMINOLOGY',
  'BACHELOR OF SCIENCE IN COMPUTER SCIENCE',
  'BSCS-DS BACHELOR OF SCIENCE IN COMPUTER SCIENCE - WITH SPECIAL TRAINING IN DATA SCIENCE AND ANALYTICS',
  'BSE BACHELOR OF SCIENCE IN ENTREPRENEURSHIP',
  'BSE-BS - BACHELOR OF SECONDARY EDUCATION MAJOR IN BIOLOGICAL SCIENCE',
  'BSE-E BACHELOR OF SECONDARY EDUCATION MAJOR IN ENGLISH',
  'BSE-F - BACHELOR OF SECONDARY EDUCATION MAJOR IN FILIPIΝΟ',
  'BSE-M BACHELOR OF SECONDARY EDUCATION - MAJOR IN MATHEMATICS',
  'BSE-MAPEH BACHELOR OF SECONDARY EDUCATION MAJOR IN MAPEH',
  'BSE-PS BACHELOR OF SECONDARY EDUCATION MAJOR IN PHYSICAL SCIENCE',
  'BSE-S BACHELOR OF SECONDARY EDUCATION MAJOR IN SCIENCE',
  'BSE-SS BACHELOR OF SECONDARY EDUCATION MAJOR IN SOCIAL STUDIES',
  'BSE-UNIT EARNER - BACHELOR OF SECONDARY EDUCATION (UNIT EARNER)',
  'BSED BACHELOR OF SECONDARY EDUCATION (UNIT EARNER)',
  'BSEMC-DA BACHELOR OF SCIENCE IN ENTERTAINMENT AND MULTIMEDIA COMPUTING-DA DIGITAL ANIMATION',
  'BSEMC-GD BACHELOR OF SCIENCE IN ENTERTAINMENT AND MULTIMEDIA COMPUTING-GD-GAME DEVELOPMENT',
  'BSF BATSILYER NG SINING SA FILIPINO',
  'BSHM BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT',
  'BSHM REV. BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT REV.',
  'BSHRM BACHELOR OF SCIENCE IN HOTEL AND RESTAURANT MANAGEMENT',
  'BSIA BACHELOR OF SCIENCE IN INTERNAL AUDITING',
  'BSISM BACHELOR OF SCIENCE IN INDUSTRIAL SECURITY MANAGEMENT',
  'BSIT BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY',
  'BSIT-CA BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY (WITH SPECIAL TRAINING COURSES IN COMPUTER ANIMATION)',
  'BACHELOR OF SCIENCE IN MANAGEMENT ACCOUNTING BSMA',
  'BSN BACHELOR OF SCIENCE IN NURSING',
  'BSNED BACHELOR OF SPECIAL NEEDS EDUCATION',
  'BSOA BACHELOR OF SCIENCE IN OFFICE ADMINISTRATION',
  'BSOA-IOM BACHELOR OF SCIENCE IN OFFICE ADMINISTRATION WITH SPECIALIZATION IN INDUSTRIAL OFFICE MANAGEMENT',
  'BSOA-LOM - BACHELOR OF SCIENCE IN OFFICE ADMINISTRATION - WITH SPECIALIZATION IN LEGAL OFFICE MANAGEMENT',
  'BACHELOR OF SPECIAL EDUCATION BSPEd',
  'BSSE BACHELOR OF SCIENCE IN SOCIAL ENTREPRENEURSHIP',
  'BSSE-AB BACHELOR OF SCIENCE IN SOCIAL ENTREPRENEURSHIP - WITH SPECIALIZATION IN AGRI-AQUA BUSINESS',
  'BSSE-ACB BACHELOR OF SCIENCE IN SOCIAL ENTREPRENEURSHIP WITH SPECIALIZATION IN ARTS AND CRAFTS BUSINESS',
  'BSTM BACHELOR OF SCIENCE IN TOURISM MANAGEMENT',
  'CES1 Consumer Electronics Servicing NC II',
  'CHS Computer Hardware Servicing NC II',
  'CPA R - CPA-REFRESHER',
  'CS - Computer Secretarial',
  'DRA - DOCTOR IN BUSINESS ADMINISTRATION',
  'DHRST - DIPLOMA IN HOTEL AND RESTAURANT SERVICES TECHNOLOGY',
  'DIT DIPLOMA IN INFORMATION TECHNOLOGY',
  'DM DOCTOR OF MANAGEMENT IN ORGANIZATIONAL MANAGEMENT',
  'DM-OM',
  'DOCTOR OF MANAGEMENT - MAJOR IN ORGANIZATIONAL MANAGEMENT',
  'DT - Drafting Technology',
  'DT1 - Drafting Technology (One Year)',
  'ETC - Electronic Technician Course',
  'GEN.ED-BAP - GENERAL EDUCATION',
  'GEN.ED-TE - GENERAL EDUCATION',
  'GS GRADE SCHOOL',
  'HMDP - HOTEL AND RESTAURANT SERVICES TECHNOLOGY',
  'HS -HIGH SCHOOL',
  'ITDP - INFORMATION TECHNOLOGY DIPLOMA PROGRAM',
  'JD - Juris Doctor',
  'LAW - JURIS DOCTOR',
  'MACSEA MASTER OF ARTS IN COMMUNITY STUDIES AND EXTENSION ADMINISTRATION',
  'MAEM MASTER OF ARTS IN EDUCATIONAL MANAGEMENT',
  'MAGC MASTER OF ARTS IN GUIDANCE AND COUNSELING',
  'MAN-MSN MASTER OF ARTS IN NURSING - MAJOR IN MEDICAL-SURGICAL NURSING',
  'MAN-NSA MASTER OF ARTS IN NURSING MAJOR IN NURSING SUPERVISION AND ADMINISTRATION',
  'MANM MASTER OF ARTS IN NURSING WITH SPECIAL TRAINING COURSES IN MEDICAL-SURGICAL NURSING',
  'MANN MASTER OF ARTS IN NURSING WITH SPECIAL TRAINING COURSES IN NURSING SUPERVISION',
  'MATE MASTER OF ARTS IN TEACHING ENGLISH',
  'MATF MASTER OF ARTS IN TEACHING FILIPINO',
  'MATGS MASTER OF ARTS IN TEACHING GENERAL SCIENCE',
  'MATSE MASTER OF ARTS IN TEACHING SPECIAL EDUCATION',
  'MBA -MASTER IN BUSINESS ADMINISTRATION',
  'MBA-BM MASTER IN BUSINESS ADMINISTRATION (WITH SPECIALIZATION IN BUSINESS MANAGEMENT)',
  'MBA-HR MASTER IN BUSINESS ADMINISTRATION (WITH SPECIALIZATION IN HUMAN RESOURCE MANAGEMENT)',
  'MBA-HRM MASTER OF BUSINESS ADMINISTRATION - HUMAN RESOURCE MANAGEMENT',
  'MNC1 Machining NC II',
  'MPA MASTER IN PUBLIC ADMINISTRATION',
  'MSPE MASTER OF SCIENCE IN PHYSICAL EDUCATION',
  'MST MACHINE SHOP TECHNOLOGY',
  'MSTM MASTER OF SCIENCE IN TEACHING MATHEMATICS',
  'PCO PC Operations NC II',
  'PHD DOCTOR OF PHILOSOPHY IN EDUCATION',
  'PRG Programming NC IV',
];

export default function Courses() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/settings/key/courses');
      const arr = safeParseArray(data?.setting_value);
      setList(arr);
    } catch (e) {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const safeParseArray = (value) => {
    try {
      const parsed = JSON.parse(value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  };

  const saveCourses = async () => {
    const payload = JSON.stringify(uniqueSorted(list));
    try {
      await axios.put('/api/settings/key/courses', { setting_value: payload });
      setMessage('Courses saved');
    } catch (e) {
      if (e?.response?.status === 404) {
        try {
          await axios.post('/api/settings', {
            setting_key: 'courses',
            setting_value: payload,
            setting_type: 'json',
            category: 'academics',
            description: 'Available courses list',
            is_public: false,
          });
          setMessage('Courses created');
        } catch {
          setMessage('Failed to save courses');
        }
      } else {
        setMessage('Failed to save courses');
      }
    }
  };

  const uniqueSorted = (arr) => Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b));

  const addCourse = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setList(prev => uniqueSorted([...prev, trimmed]));
  };

  const removeCourse = (idx) => setList(prev => prev.filter((_, i) => i !== idx));

  const resetToDefault = () => setList(uniqueSorted(DEFAULT_COURSES));

  const visible = filter ? list.filter(c => c.toLowerCase().includes(filter.toLowerCase())) : list;

  return (
    <div className="students-page">
      <div className="module-page">
        <div className="page-header">
          <h1>Courses</h1>
        </div>

        {message && <div className="alert alert-info" style={{marginTop:8}}>{message}</div>}

        <div className="students-panel">
          <div className="panel-header">
            <h2>Course Management</h2>
            <div className="panel-controls">
              <input className="search-input" placeholder="Filter courses" value={filter} onChange={(e)=>setFilter(e.target.value)} />
              <div className="filters">
                <button type="button" className="btn btn-primary" onClick={saveCourses}>Save</button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2>Manage Courses</h2>
          <div className="module-form" style={{gap:12}}>
            <div className="form-row" style={{gridTemplateColumns:'1fr auto auto'}}>
              <input placeholder="Add a course" onKeyDown={(e)=>{ if(e.key==='Enter'){ addCourse(e.target.value); e.target.value=''; } }} />
              <button type="button" className="btn btn-secondary" onClick={(e)=>{ const el = e.currentTarget.previousSibling; addCourse(el.value||''); el.value=''; }}>Add</button>
              <button type="button" className="btn btn-secondary" onClick={resetToDefault}>Use Default List</button>
            </div>
          </div>
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="2">Loading...</td></tr>
              )}
              {!loading && visible.length === 0 && (
                <tr><td colSpan="2" style={{color:'var(--text-secondary)'}}>No courses to show.</td></tr>
              )}
              {!loading && visible.map((c, idx) => (
                <tr key={c + idx}>
                  <td style={{minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c}</td>
                  <td className="actions">
                    <button type="button" className="btn-chip btn-delete" onClick={()=>removeCourse(list.indexOf(c))}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
