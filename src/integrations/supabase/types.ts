export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      athletes: {
        Row: {
          agregado_por: string | null
          avatar_url: string | null
          categoria: Database["public"]["Enums"]["athlete_category"] | null
          created_at: string
          deporte: string
          deporte_personalizado: string | null
          dia_pago: number
          email: string
          establecimiento_id: string
          estado_manual: Database["public"]["Enums"]["manual_status"]
          estado_sistema: Database["public"]["Enums"]["system_status"]
          fecha_nacimiento: string | null
          id: string
          identificacion: string | null
          monto_mensual: number
          nombre: string
          proximo_pago: string
          referido_por: string | null
          telefono: string
          ultimo_pago: string | null
          updated_at: string
          validado: boolean
        }
        Insert: {
          agregado_por?: string | null
          avatar_url?: string | null
          categoria?: Database["public"]["Enums"]["athlete_category"] | null
          created_at?: string
          deporte: string
          deporte_personalizado?: string | null
          dia_pago?: number
          email?: string
          establecimiento_id: string
          estado_manual?: Database["public"]["Enums"]["manual_status"]
          estado_sistema?: Database["public"]["Enums"]["system_status"]
          fecha_nacimiento?: string | null
          id?: string
          identificacion?: string | null
          monto_mensual?: number
          nombre: string
          proximo_pago?: string
          referido_por?: string | null
          telefono?: string
          ultimo_pago?: string | null
          updated_at?: string
          validado?: boolean
        }
        Update: {
          agregado_por?: string | null
          avatar_url?: string | null
          categoria?: Database["public"]["Enums"]["athlete_category"] | null
          created_at?: string
          deporte?: string
          deporte_personalizado?: string | null
          dia_pago?: number
          email?: string
          establecimiento_id?: string
          estado_manual?: Database["public"]["Enums"]["manual_status"]
          estado_sistema?: Database["public"]["Enums"]["system_status"]
          fecha_nacimiento?: string | null
          id?: string
          identificacion?: string | null
          monto_mensual?: number
          nombre?: string
          proximo_pago?: string
          referido_por?: string | null
          telefono?: string
          ultimo_pago?: string | null
          updated_at?: string
          validado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "athletes_establecimiento_id_fkey"
            columns: ["establecimiento_id"]
            isOneToOne: false
            referencedRelation: "establecimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      establecimientos: {
        Row: {
          admin_id: string
          codigo_club: string
          configuracion_completa: boolean
          created_at: string
          dias_aviso_vencimiento: number
          id: string
          logo_url: string | null
          moneda: string
          nombre: string
          pais: string
          simbolo_moneda: string
          updated_at: string
          zona_horaria: string
        }
        Insert: {
          admin_id: string
          codigo_club: string
          configuracion_completa?: boolean
          created_at?: string
          dias_aviso_vencimiento?: number
          id?: string
          logo_url?: string | null
          moneda?: string
          nombre: string
          pais?: string
          simbolo_moneda?: string
          updated_at?: string
          zona_horaria?: string
        }
        Update: {
          admin_id?: string
          codigo_club?: string
          configuracion_completa?: boolean
          created_at?: string
          dias_aviso_vencimiento?: number
          id?: string
          logo_url?: string | null
          moneda?: string
          nombre?: string
          pais?: string
          simbolo_moneda?: string
          updated_at?: string
          zona_horaria?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          activo: boolean
          created_at: string
          es_personalizado: boolean
          establecimiento_id: string
          icono: string
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          es_personalizado?: boolean
          establecimiento_id: string
          icono?: string
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          es_personalizado?: boolean
          establecimiento_id?: string
          icono?: string
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_establecimiento_id_fkey"
            columns: ["establecimiento_id"]
            isOneToOne: false
            referencedRelation: "establecimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nombre: string
          telefono: string | null
          tutorial_completado: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nombre?: string
          telefono?: string | null
          tutorial_completado?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          telefono?: string | null
          tutorial_completado?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      staff_athlete_assignments: {
        Row: {
          athlete_id: string
          created_at: string
          id: string
          staff_id: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          id?: string
          staff_id: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          id?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_athlete_assignments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_athlete_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_users"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_users: {
        Row: {
          activo: boolean
          admin_id: string
          codigo_acceso: string
          created_at: string
          establecimiento_id: string
          fecha_invitacion: string
          id: string
          nombre: string
          permisos: string[]
          puede_agregar_deportistas: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activo?: boolean
          admin_id: string
          codigo_acceso: string
          created_at?: string
          establecimiento_id: string
          fecha_invitacion?: string
          id?: string
          nombre: string
          permisos?: string[]
          puede_agregar_deportistas?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activo?: boolean
          admin_id?: string
          codigo_acceso?: string
          created_at?: string
          establecimiento_id?: string
          fecha_invitacion?: string
          id?: string
          nombre?: string
          permisos?: string[]
          puede_agregar_deportistas?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_users_establecimiento_id_fkey"
            columns: ["establecimiento_id"]
            isOneToOne: false
            referencedRelation: "establecimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          athlete_id: string
          comprobante_url: string | null
          created_at: string
          fecha: string
          id: string
          meses_pagados: number
          metodo_pago: string
          moneda: string
          monto: number
          monto_personalizado: number | null
          observaciones: string | null
          referencia: string | null
          registrado_por: string | null
          registrado_por_nombre: string
        }
        Insert: {
          athlete_id: string
          comprobante_url?: string | null
          created_at?: string
          fecha?: string
          id?: string
          meses_pagados?: number
          metodo_pago: string
          moneda?: string
          monto: number
          monto_personalizado?: number | null
          observaciones?: string | null
          referencia?: string | null
          registrado_por?: string | null
          registrado_por_nombre?: string
        }
        Update: {
          athlete_id?: string
          comprobante_url?: string | null
          created_at?: string
          fecha?: string
          id?: string
          meses_pagados?: number
          metodo_pago?: string
          moneda?: string
          monto?: number
          monto_personalizado?: number | null
          observaciones?: string | null
          referencia?: string | null
          registrado_por?: string | null
          registrado_por_nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_establecimiento_id: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      verify_club_code: { Args: { _club_code: string }; Returns: string }
      verify_staff_access: {
        Args: { _codigo_acceso: string; _establecimiento_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "staff"
      athlete_category:
        | "principiante"
        | "intermedio"
        | "avanzado"
        | "profesional"
        | "infantil"
        | "juvenil"
        | "adulto"
      manual_status: "pagado" | "pendiente" | "inactivo"
      system_status: "al_dia" | "por_vencer" | "vencido"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff"],
      athlete_category: [
        "principiante",
        "intermedio",
        "avanzado",
        "profesional",
        "infantil",
        "juvenil",
        "adulto",
      ],
      manual_status: ["pagado", "pendiente", "inactivo"],
      system_status: ["al_dia", "por_vencer", "vencido"],
    },
  },
} as const
