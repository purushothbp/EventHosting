import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Education, Experience, Project, Skill, Certification } from '../types/profile';

// Register font if needed (optional)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf',
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  item: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#4B5563',
  },
  itemDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  itemDescription: {
    fontSize: 10,
    color: '#4B5563',
    marginTop: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    padding: '4px 8px',
    fontSize: 10,
    color: '#111827',
  },
});

interface ResumePDFProps {
  profile: {
    name: string;
    email: string;
    role: string;
    bio?: string;
    phone?: string;
    location?: string;
    website?: string;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    projects: Project[];
    certifications?: Certification[];
  };
}

export const ResumePDF = ({ profile }: ResumePDFProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const getSkillLevel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Basic';
      case 'intermediate':
        return 'Intermediate';
      case 'advanced':
        return 'Advanced';
      case 'expert':
        return 'Expert';
      default:
        return level;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.title}>{profile.role}</Text>
            <Text style={styles.contactInfo}>{profile.email}</Text>
            {profile.phone && <Text style={styles.contactInfo}>{profile.phone}</Text>}
            {profile.location && <Text style={styles.contactInfo}>{profile.location}</Text>}
            {profile.website && <Text style={styles.contactInfo}>{profile.website}</Text>}
          </View>
        </View>

        {/* About */}
        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.itemDescription}>{profile.bio}</Text>
          </View>
        )}

        {/* Experience */}
        {profile.experience && profile.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.experience.map((exp) => (
              <View key={exp._id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{exp.position}</Text>
                    <Text style={styles.itemSubtitle}>
                      {exp.company}
                    </Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate || '')}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={styles.itemDescription}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((edu) => (
              <View key={edu._id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                    <Text style={styles.itemSubtitle}>
                      {edu.institution}
                      {edu.field && `, ${edu.field}`}
                    </Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate || '')}
                  </Text>
                </View>
                {edu.gpa && (
                  <Text style={styles.itemDescription}>GPA: {edu.gpa}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill) => (
                <Text key={skill._id} style={styles.skillTag}>
                  {skill.name} ({getSkillLevel(skill.level)})
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {profile.projects && profile.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {profile.projects.map((project) => (
              <View key={project._id} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{project.name}</Text>
                  <Text style={styles.itemDate}>
                    {formatDate(project.startDate)} - {formatDate(project.endDate || '')}
                  </Text>
                </View>
                <Text style={styles.itemDescription}>{project.description}</Text>
                {project.technologies && project.technologies.length > 0 && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: 9, color: '#6B7280', marginBottom: 2 }}>Technologies:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                      {project.technologies.map((tech: string, techIndex: number) => (
                        <Text key={techIndex} style={styles.skillTag}>
                          {tech}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {profile.certifications.map((cert, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemTitle}>{cert.name}</Text>
                <Text style={styles.itemSubtitle}>{cert.issuer}</Text>
                <Text style={styles.itemDate}>
                  Issued {formatDate(cert.issueDate)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ResumePDF;
