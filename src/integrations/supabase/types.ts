export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      "Actity subtopic item": {
        Row: {
          "Activity item Id": number | null
          created_at: string
          Grade: number | null
          id: number
          "Subtopic ID": number | null
        }
        Insert: {
          "Activity item Id"?: number | null
          created_at?: string
          Grade?: number | null
          id?: number
          "Subtopic ID"?: number | null
        }
        Update: {
          "Activity item Id"?: number | null
          created_at?: string
          Grade?: number | null
          id?: number
          "Subtopic ID"?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Actity subtopic item_Activity item Id_fkey"
            columns: ["Activity item Id"]
            isOneToOne: false
            referencedRelation: "Activity item"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Actity subtopic item_Subtopic ID_fkey"
            columns: ["Subtopic ID"]
            isOneToOne: false
            referencedRelation: "Subtopic"
            referencedColumns: ["id"]
          },
        ]
      }
      Activity: {
        Row: {
          "Activity type": Database["public"]["Enums"]["Activity type"] | null
          ClassId: number | null
          created_at: string
          Date: string | null
          Description: string | null
          Duration: number | null
          id: number
          PersonId: number | null
          "Responsible professor": number | null
          Status: Database["public"]["Enums"]["Activity status"] | null
          SubjectId: number | null
          SubtopicId: number | null
          TIme: string | null
          Title: string | null
          TopicId: number | null
        }
        Insert: {
          "Activity type"?: Database["public"]["Enums"]["Activity type"] | null
          ClassId?: number | null
          created_at?: string
          Date?: string | null
          Description?: string | null
          Duration?: number | null
          id?: number
          PersonId?: number | null
          "Responsible professor"?: number | null
          Status?: Database["public"]["Enums"]["Activity status"] | null
          SubjectId?: number | null
          SubtopicId?: number | null
          TIme?: string | null
          Title?: string | null
          TopicId?: number | null
        }
        Update: {
          "Activity type"?: Database["public"]["Enums"]["Activity type"] | null
          ClassId?: number | null
          created_at?: string
          Date?: string | null
          Description?: string | null
          Duration?: number | null
          id?: number
          PersonId?: number | null
          "Responsible professor"?: number | null
          Status?: Database["public"]["Enums"]["Activity status"] | null
          SubjectId?: number | null
          SubtopicId?: number | null
          TIme?: string | null
          Title?: string | null
          TopicId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Activity_ClassId_fkey"
            columns: ["ClassId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activity_PersonId_fkey"
            columns: ["PersonId"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activity_Responsible professor_fkey"
            columns: ["Responsible professor"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activity_SubjectId_fkey"
            columns: ["SubjectId"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activity_SubtopicId_fkey"
            columns: ["SubtopicId"]
            isOneToOne: false
            referencedRelation: "Subtopic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activity_TopicId_fkey"
            columns: ["TopicId"]
            isOneToOne: false
            referencedRelation: "Topic"
            referencedColumns: ["id"]
          },
        ]
      }
      "Activity item": {
        Row: {
          Activity: Database["public"]["Enums"]["Activity status"] | null
          ActivityId: number | null
          created_at: string
          Date: string | null
          Grade: number | null
          id: number
          Name: string | null
          Student: number
          Time: string | null
        }
        Insert: {
          Activity?: Database["public"]["Enums"]["Activity status"] | null
          ActivityId?: number | null
          created_at?: string
          Date?: string | null
          Grade?: number | null
          id?: number
          Name?: string | null
          Student: number
          Time?: string | null
        }
        Update: {
          Activity?: Database["public"]["Enums"]["Activity status"] | null
          ActivityId?: number | null
          created_at?: string
          Date?: string | null
          Grade?: number | null
          id?: number
          Name?: string | null
          Student?: number
          Time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Activity item_ActivityId_fkey"
            columns: ["ActivityId"]
            isOneToOne: false
            referencedRelation: "Activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activity item_Student_fkey"
            columns: ["Student"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
        ]
      }
      "Activity person item": {
        Row: {
          Activity: number | null
          created_at: string
          id: number
          Student: number | null
        }
        Insert: {
          Activity?: number | null
          created_at?: string
          id?: number
          Student?: number | null
        }
        Update: {
          Activity?: number | null
          created_at?: string
          id?: number
          Student?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Activity person item_Activity_fkey"
            columns: ["Activity"]
            isOneToOne: false
            referencedRelation: "Activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Activity person item_Student_fkey"
            columns: ["Student"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          content: string
          created_at: string
          id: string
          is_correct: boolean
          option_letter: string
          question_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_correct?: boolean
          option_letter: string
          question_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_correct?: boolean
          option_letter?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_levels: {
        Row: {
          created_at: string
          id: number
          max_value: number
          min_value: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          max_value: number
          min_value: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          max_value?: number
          min_value?: number
          name?: string
        }
        Relationships: []
      }
      badge_types: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          color: string
          created_at: string
          description: string
          icon: string
          id: number
          is_general: boolean | null
          level_id: number | null
          name: string
          subject_id: number | null
          type_id: number | null
        }
        Insert: {
          color: string
          created_at?: string
          description: string
          icon: string
          id?: number
          is_general?: boolean | null
          level_id?: number | null
          name: string
          subject_id?: number | null
          type_id?: number | null
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          icon?: string
          id?: number
          is_general?: boolean | null
          level_id?: number | null
          name?: string
          subject_id?: number | null
          type_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "badge_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badges_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badges_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "badge_types"
            referencedColumns: ["id"]
          },
        ]
      }
      Class: {
        Row: {
          created_at: string
          Description: string | null
          "End Date": string | null
          id: number
          Name: string
          SchoolId: number | null
          "Start Date": string | null
        }
        Insert: {
          created_at?: string
          Description?: string | null
          "End Date"?: string | null
          id?: number
          Name: string
          SchoolId?: number | null
          "Start Date"?: string | null
        }
        Update: {
          created_at?: string
          Description?: string | null
          "End Date"?: string | null
          id?: number
          Name?: string
          SchoolId?: number | null
          "Start Date"?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Class_SchoolId_fkey"
            columns: ["SchoolId"]
            isOneToOne: false
            referencedRelation: "School"
            referencedColumns: ["id"]
          },
        ]
      }
      configurations: {
        Row: {
          created_at: string
          description: string | null
          id: number
          key: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          key: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          key?: string
          value?: string
        }
        Relationships: []
      }
      Courses: {
        Row: {
          created_at: string
          id: number
          Name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          Name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          Name?: string | null
        }
        Relationships: []
      }
      Examen: {
        Row: {
          created_at: string
          Description: string | null
          id: number
          Name: string | null
        }
        Insert: {
          created_at?: string
          Description?: string | null
          id?: number
          Name?: string | null
        }
        Update: {
          created_at?: string
          Description?: string | null
          id?: number
          Name?: string | null
        }
        Relationships: []
      }
      "Examen Year": {
        Row: {
          created_at: string
          "Date first phase": string | null
          "Date second phase": string | null
          ExamenId: number | null
          id: number
          Year: number | null
        }
        Insert: {
          created_at?: string
          "Date first phase"?: string | null
          "Date second phase"?: string | null
          ExamenId?: number | null
          id?: number
          Year?: number | null
        }
        Update: {
          created_at?: string
          "Date first phase"?: string | null
          "Date second phase"?: string | null
          ExamenId?: number | null
          id?: number
          Year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Examen Year_ExamenId_fkey"
            columns: ["ExamenId"]
            isOneToOne: false
            referencedRelation: "Examen"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sessions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          correct_answers: number
          created_at: string
          id: string
          person_id: number
          subject_id: number | null
          subtopic_id: number | null
          topic_id: number | null
          total_questions: number
          total_time_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          id?: string
          person_id: number
          subject_id?: number | null
          subtopic_id?: number | null
          topic_id?: number | null
          total_questions?: number
          total_time_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          correct_answers?: number
          created_at?: string
          id?: string
          person_id?: number
          subject_id?: number | null
          subtopic_id?: number | null
          topic_id?: number | null
          total_questions?: number
          total_time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sessions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sessions_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "Subtopic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "Topic"
            referencedColumns: ["id"]
          },
        ]
      }
      "Gamification level": {
        Row: {
          created_at: string
          id: number
          "Max xp": number | null
          Name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          "Max xp"?: number | null
          Name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          "Max xp"?: number | null
          Name?: string | null
        }
        Relationships: []
      }
      Goal: {
        Row: {
          Class: number | null
          CourseId: number | null
          created_at: string
          Date: string | null
          Description: string | null
          ExamenId: number | null
          id: number
          Name: string | null
          PersonId: number
          Progression: number | null
        }
        Insert: {
          Class?: number | null
          CourseId?: number | null
          created_at?: string
          Date?: string | null
          Description?: string | null
          ExamenId?: number | null
          id?: number
          Name?: string | null
          PersonId: number
          Progression?: number | null
        }
        Update: {
          Class?: number | null
          CourseId?: number | null
          created_at?: string
          Date?: string | null
          Description?: string | null
          ExamenId?: number | null
          id?: number
          Name?: string | null
          PersonId?: number
          Progression?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Goal_Class_fkey"
            columns: ["Class"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Goal_CourseId_fkey"
            columns: ["CourseId"]
            isOneToOne: false
            referencedRelation: "Courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Goal_ExamenId_fkey"
            columns: ["ExamenId"]
            isOneToOne: false
            referencedRelation: "Examen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Goal_PersonId_fkey"
            columns: ["PersonId"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
        ]
      }
      help_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      "Overall Performance": {
        Row: {
          created_at: string
          id: number
          Performance: number | null
          PersonId: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          Performance?: number | null
          PersonId?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          Performance?: number | null
          PersonId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Overall Performance_PersonId_fkey"
            columns: ["PersonId"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
        ]
      }
      "Performance History": {
        Row: {
          created_at: string
          id: number
          Month: string
          Performance: number
          PersonId: number
          SubjectId: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          Month: string
          Performance?: number
          PersonId: number
          SubjectId?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          Month?: string
          Performance?: number
          PersonId?: number
          SubjectId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Performance History_PersonId_fkey"
            columns: ["PersonId"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Performance History_SubjectId_fkey"
            columns: ["SubjectId"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
        ]
      }
      Person: {
        Row: {
          Birthdate: string | null
          created_at: string
          Email: string | null
          "Gamification score": number | null
          Gender: Database["public"]["Enums"]["Gender"] | null
          id: number
          Name: string
          "Overall Performance": number | null
          "Overall Plan Study Progress": number | null
          Parent: number | null
          Phone: string | null
          ProfileId: string | null
          Role: Database["public"]["Enums"]["Role"] | null
          School: number | null
        }
        Insert: {
          Birthdate?: string | null
          created_at?: string
          Email?: string | null
          "Gamification score"?: number | null
          Gender?: Database["public"]["Enums"]["Gender"] | null
          id?: number
          Name: string
          "Overall Performance"?: number | null
          "Overall Plan Study Progress"?: number | null
          Parent?: number | null
          Phone?: string | null
          ProfileId?: string | null
          Role?: Database["public"]["Enums"]["Role"] | null
          School?: number | null
        }
        Update: {
          Birthdate?: string | null
          created_at?: string
          Email?: string | null
          "Gamification score"?: number | null
          Gender?: Database["public"]["Enums"]["Gender"] | null
          id?: number
          Name?: string
          "Overall Performance"?: number | null
          "Overall Plan Study Progress"?: number | null
          Parent?: number | null
          Phone?: string | null
          ProfileId?: string | null
          Role?: Database["public"]["Enums"]["Role"] | null
          School?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Person_Parent_fkey"
            columns: ["Parent"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Person_ProfileId_fkey"
            columns: ["ProfileId"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Person_School_fkey"
            columns: ["School"]
            isOneToOne: false
            referencedRelation: "School"
            referencedColumns: ["id"]
          },
        ]
      }
      "Person class item": {
        Row: {
          ClassId: number
          created_at: string
          "End Date": string | null
          id: number
          PersonId: number
          "Start Date": string | null
        }
        Insert: {
          ClassId: number
          created_at?: string
          "End Date"?: string | null
          id?: number
          PersonId: number
          "Start Date"?: string | null
        }
        Update: {
          ClassId?: number
          created_at?: string
          "End Date"?: string | null
          id?: number
          PersonId?: number
          "Start Date"?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Person class item_ClassId_fkey"
            columns: ["ClassId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Person class item_PersonId_fkey"
            columns: ["PersonId"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
        ]
      }
      person_badges: {
        Row: {
          badge_id: number
          created_at: string
          id: number
          person_id: number
          progress: number | null
          unlocked: boolean | null
          unlocked_at: string | null
        }
        Insert: {
          badge_id: number
          created_at?: string
          id?: number
          person_id: number
          progress?: number | null
          unlocked?: boolean | null
          unlocked_at?: string | null
        }
        Update: {
          badge_id?: number
          created_at?: string
          id?: number
          person_id?: number
          progress?: number | null
          unlocked?: boolean | null
          unlocked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_badges_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          birthdate: string | null
          created_at: string | null
          email: string | null
          gender: string | null
          id: string
          name: string | null
          Phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id: string
          name?: string | null
          Phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          birthdate?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          name?: string | null
          Phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          attempted_at: string
          id: string
          is_correct: boolean | null
          needs_review: boolean | null
          person_id: number
          question_id: string
          selected_answer_id: string | null
          time_spent_seconds: number | null
        }
        Insert: {
          attempted_at?: string
          id?: string
          is_correct?: boolean | null
          needs_review?: boolean | null
          person_id: number
          question_id: string
          selected_answer_id?: string | null
          time_spent_seconds?: number | null
        }
        Update: {
          attempted_at?: string
          id?: string
          is_correct?: boolean | null
          needs_review?: boolean | null
          person_id?: number
          question_id?: string
          selected_answer_id?: string | null
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_selected_answer_id_fkey"
            columns: ["selected_answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          content: string
          created_at: string
          difficulty: number
          explanation: string
          id: string
          subject_id: number
          subtopic_id: number | null
          topic_id: number | null
        }
        Insert: {
          content: string
          created_at?: string
          difficulty?: number
          explanation: string
          id?: string
          subject_id: number
          subtopic_id?: number | null
          topic_id?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          difficulty?: number
          explanation?: string
          id?: string
          subject_id?: number
          subtopic_id?: number | null
          topic_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subtopic_id_fkey"
            columns: ["subtopic_id"]
            isOneToOne: false
            referencedRelation: "Subtopic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "Topic"
            referencedColumns: ["id"]
          },
        ]
      }
      School: {
        Row: {
          "Active?": boolean | null
          City: string
          Country: string
          created_at: string
          Description: string | null
          Email: string | null
          id: number
          "Legal Name": string | null
          "Legal number": string
          "Number of students": number | null
          "Parent school": string | null
          "Postal code": string | null
          "School name": string
          "School type": Database["public"]["Enums"]["School type"] | null
          State: string | null
          Street: string | null
          Website: string | null
        }
        Insert: {
          "Active?"?: boolean | null
          City: string
          Country: string
          created_at?: string
          Description?: string | null
          Email?: string | null
          id?: number
          "Legal Name"?: string | null
          "Legal number": string
          "Number of students"?: number | null
          "Parent school"?: string | null
          "Postal code"?: string | null
          "School name": string
          "School type"?: Database["public"]["Enums"]["School type"] | null
          State?: string | null
          Street?: string | null
          Website?: string | null
        }
        Update: {
          "Active?"?: boolean | null
          City?: string
          Country?: string
          created_at?: string
          Description?: string | null
          Email?: string | null
          id?: number
          "Legal Name"?: string | null
          "Legal number"?: string
          "Number of students"?: number | null
          "Parent school"?: string | null
          "Postal code"?: string | null
          "School name"?: string
          "School type"?: Database["public"]["Enums"]["School type"] | null
          State?: string | null
          Street?: string | null
          Website?: string | null
        }
        Relationships: []
      }
      session_questions: {
        Row: {
          answer_id: string | null
          created_at: string
          id: string
          is_correct: boolean | null
          needs_review: boolean | null
          question_id: string
          session_id: string
          time_spent_seconds: number | null
        }
        Insert: {
          answer_id?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          needs_review?: boolean | null
          question_id: string
          session_id: string
          time_spent_seconds?: number | null
        }
        Update: {
          answer_id?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean | null
          needs_review?: boolean | null
          question_id?: string
          session_id?: string
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_questions_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_questions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "exercise_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      "Student Subtopic percentage": {
        Row: {
          created_at: string
          id: number
          Percentage: number | null
          StudentId: number
          SubtopicID: number
        }
        Insert: {
          created_at?: string
          id?: number
          Percentage?: number | null
          StudentId: number
          SubtopicID: number
        }
        Update: {
          created_at?: string
          id?: number
          Percentage?: number | null
          StudentId?: number
          SubtopicID?: number
        }
        Relationships: [
          {
            foreignKeyName: "Student Subtopic percentage_StudentId_fkey"
            columns: ["StudentId"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Student Subtopic percentage_SubtopicID_fkey"
            columns: ["SubtopicID"]
            isOneToOne: false
            referencedRelation: "Subtopic"
            referencedColumns: ["id"]
          },
        ]
      }
      Subject: {
        Row: {
          created_at: string
          Description: string | null
          id: number
          Name: string | null
        }
        Insert: {
          created_at?: string
          Description?: string | null
          id?: number
          Name?: string | null
        }
        Update: {
          created_at?: string
          Description?: string | null
          id?: number
          Name?: string | null
        }
        Relationships: []
      }
      "Subject Performance": {
        Row: {
          ClassId: number | null
          created_at: string
          Goal: number | null
          id: number
          Performance: number | null
          PersonId: number | null
          ProfileId: string | null
          SubjectId: number | null
        }
        Insert: {
          ClassId?: number | null
          created_at?: string
          Goal?: number | null
          id?: number
          Performance?: number | null
          PersonId?: number | null
          ProfileId?: string | null
          SubjectId?: number | null
        }
        Update: {
          ClassId?: number | null
          created_at?: string
          Goal?: number | null
          id?: number
          Performance?: number | null
          PersonId?: number | null
          ProfileId?: string | null
          SubjectId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Person Subject Performance_ClassId_fkey"
            columns: ["ClassId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Person Subject Performance_SubjectId_fkey"
            columns: ["SubjectId"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subject Performance_PersonId_fkey"
            columns: ["PersonId"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
        ]
      }
      Subtopic: {
        Row: {
          created_at: string
          Description: string | null
          id: number
          Name: string | null
          TopicId: number
        }
        Insert: {
          created_at?: string
          Description?: string | null
          id?: number
          Name?: string | null
          TopicId: number
        }
        Update: {
          created_at?: string
          Description?: string | null
          id?: number
          Name?: string | null
          TopicId?: number
        }
        Relationships: [
          {
            foreignKeyName: "Subtopic_TopicId_fkey"
            columns: ["TopicId"]
            isOneToOne: false
            referencedRelation: "Topic"
            referencedColumns: ["id"]
          },
        ]
      }
      "Subtopic Performance": {
        Row: {
          ClassId: number | null
          created_at: string
          Goal: number | null
          id: number
          Performance: number | null
          PersonId: number | null
          SubtopicId: number | null
        }
        Insert: {
          ClassId?: number | null
          created_at?: string
          Goal?: number | null
          id?: number
          Performance?: number | null
          PersonId?: number | null
          SubtopicId?: number | null
        }
        Update: {
          ClassId?: number | null
          created_at?: string
          Goal?: number | null
          id?: number
          Performance?: number | null
          PersonId?: number | null
          SubtopicId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Subtopic goal_PersonId_fkey"
            columns: ["PersonId"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subtopic goal_SubtopicId_fkey"
            columns: ["SubtopicId"]
            isOneToOne: false
            referencedRelation: "Subtopic"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subtopic Performance_ClassId_fkey"
            columns: ["ClassId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
        ]
      }
      Suggestions: {
        Row: {
          created_at: string
          id: number
          LongSuggestion: string | null
          PersonId: number | null
          Priority: Database["public"]["Enums"]["Priority"] | null
          Subject_id: number | null
          Subtitle: string | null
          "Suggestion type":
            | Database["public"]["Enums"]["Suggestion type"]
            | null
          Title: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          LongSuggestion?: string | null
          PersonId?: number | null
          Priority?: Database["public"]["Enums"]["Priority"] | null
          Subject_id?: number | null
          Subtitle?: string | null
          "Suggestion type"?:
            | Database["public"]["Enums"]["Suggestion type"]
            | null
          Title?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          LongSuggestion?: string | null
          PersonId?: number | null
          Priority?: Database["public"]["Enums"]["Priority"] | null
          Subject_id?: number | null
          Subtitle?: string | null
          "Suggestion type"?:
            | Database["public"]["Enums"]["Suggestion type"]
            | null
          Title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Suggestions_PersonId_fkey"
            columns: ["PersonId"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Suggestions_Subject_id_fkey"
            columns: ["Subject_id"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
        ]
      }
      Topic: {
        Row: {
          created_at: string
          Description: string | null
          id: number
          Name: string | null
          SubjectId: number
        }
        Insert: {
          created_at?: string
          Description?: string | null
          id?: number
          Name?: string | null
          SubjectId: number
        }
        Update: {
          created_at?: string
          Description?: string | null
          id?: number
          Name?: string | null
          SubjectId?: number
        }
        Relationships: [
          {
            foreignKeyName: "Topic_SubjectId_fkey"
            columns: ["SubjectId"]
            isOneToOne: false
            referencedRelation: "Subject"
            referencedColumns: ["id"]
          },
        ]
      }
      "Topic Performance": {
        Row: {
          ClassId: number | null
          created_at: string
          Goal: number | null
          id: number
          Performance: number | null
          PersonId: number | null
          TopicId: number
        }
        Insert: {
          ClassId?: number | null
          created_at?: string
          Goal?: number | null
          id?: number
          Performance?: number | null
          PersonId?: number | null
          TopicId: number
        }
        Update: {
          ClassId?: number | null
          created_at?: string
          Goal?: number | null
          id?: number
          Performance?: number | null
          PersonId?: number | null
          TopicId?: number
        }
        Relationships: [
          {
            foreignKeyName: "Topic Goal_ClassId_fkey"
            columns: ["ClassId"]
            isOneToOne: false
            referencedRelation: "Class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Topic Goal_PersonId_fkey"
            columns: ["PersonId"]
            isOneToOne: false
            referencedRelation: "Person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Topic Goal_TopicId_fkey"
            columns: ["TopicId"]
            isOneToOne: false
            referencedRelation: "Topic"
            referencedColumns: ["id"]
          },
        ]
      }
      University: {
        Row: {
          created_at: string
          ExamenId: number | null
          id: number
          Name: string | null
        }
        Insert: {
          created_at?: string
          ExamenId?: number | null
          id?: number
          Name?: string | null
        }
        Update: {
          created_at?: string
          ExamenId?: number | null
          id?: number
          Name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "University_ExamenId_fkey"
            columns: ["ExamenId"]
            isOneToOne: false
            referencedRelation: "Examen"
            referencedColumns: ["id"]
          },
        ]
      }
      "University Course relationship": {
        Row: {
          CourseId: number | null
          created_at: string
          id: number
          UniversityId: number | null
        }
        Insert: {
          CourseId?: number | null
          created_at?: string
          id?: number
          UniversityId?: number | null
        }
        Update: {
          CourseId?: number | null
          created_at?: string
          id?: number
          UniversityId?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "University Course relationship_CourseId_fkey"
            columns: ["CourseId"]
            isOneToOne: false
            referencedRelation: "Courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "University Course relationship_UniversityId_fkey"
            columns: ["UniversityId"]
            isOneToOne: false
            referencedRelation: "University"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_person_data:
        | {
            Args: {
              person_id: number
            }
            Returns: boolean
          }
        | {
            Args: {
              person_id: string
            }
            Returns: boolean
          }
      can_access_subject_performance: {
        Args: {
          subject_performance_row: unknown
        }
        Returns: boolean
      }
    }
    Enums: {
      "Activity status":
        | "Corrected"
        | "Reviewing"
        | "To be reviewed"
        | "Planned"
        | "Late"
        | "Done"
      "Activity type":
        | "Prova"
        | "Lição de casa"
        | "Projeto"
        | "Revisão"
        | "Aula"
      Gender: "Male" | "Female" | "Other"
      Priority:
        | "Muito Alta"
        | "Alta"
        | "Média Alta"
        | "Baixa"
        | "Muito Baixa"
        | "Média"
      Role: "Student" | "Parent" | "Teacher" | "Owner" | "Coordinator" | "Other"
      "School type": "Private" | "Public" | "ONG"
      "Suggestion type": "Strengths" | "Opportunities"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
