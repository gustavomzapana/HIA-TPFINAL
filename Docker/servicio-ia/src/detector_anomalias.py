import os
import mysql.connector
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import json
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns

def conectar_bd():
    """Establece conexión con la base de datos"""
    return mysql.connector.connect(
        host=os.getenv('DB_HOST', 'haproxy'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', 'root'),
        database=os.getenv('DB_NAME', 'apunju_db'),
        port=int(os.getenv('DB_PORT', '3306'))
    )

def obtener_datos(conn, consulta):
    """Obtiene datos de la base de datos y los devuelve como DataFrame"""
    return pd.read_sql(consulta, conn)

def detectar_anomalias(datos, columnas_numericas, contaminacion=0.05):
    """Detecta anomalías usando Isolation Forest"""
    # Asegurarse de que las columnas existan en los datos
    columnas_disponibles = [col for col in columnas_numericas if col in datos.columns]
    if not columnas_disponibles:
        raise ValueError("No se encontraron columnas numéricas para analizar")
    
    modelo = IsolationForest(contamination=contaminacion, random_state=42)
    datos['anomalia'] = modelo.fit_predict(datos[columnas_disponibles])
    datos['anomalia'] = datos['anomalia'].map({1: 0, -1: 1})  # 0=normal, 1=anomalía
    return datos

def generar_reporte_usuarios(datos, directorio_reportes='/reportes'):
    """Genera un informe con visualizaciones para usuarios"""
    os.makedirs(directorio_reportes, exist_ok=True)
    
    # Crear informe básico
    informe = {
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_usuarios": len(datos),
        "anomalias_detectadas": int(datos['anomalia'].sum()),
        "porcentaje_anomalias": round((datos['anomalia'].sum() / len(datos)) * 100, 2),
        "resumen_por_rol": datos['rol'].value_counts().to_dict(),
        "resumen_por_dependencia": datos['dependencia'].value_counts().to_dict()
    }
    
    # Guardar informe JSON
    ruta_informe = os.path.join(directorio_reportes, f"reporte_usuarios_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
    with open(ruta_informe, 'w', encoding='utf-8') as f:
        json.dump(informe, f, indent=2, ensure_ascii=False)
    
    # Generar gráficos
    plt.figure(figsize=(15, 10))
    
    # Gráfico 1: Anomalías por rol
    plt.subplot(2, 2, 1)
    sns.countplot(data=datos, x='rol', hue='anomalia', 
                 palette={0: 'blue', 1: 'red'})
    plt.title('Anomalías por Rol')
    plt.xticks(rotation=45)
    
    # Gráfico 2: Anomalías por dependencia
    plt.subplot(2, 2, 2)
    sns.countplot(data=datos, x='dependencia', hue='anomalia',
                 palette={0: 'blue', 1: 'red'})
    plt.title('Anomalías por Dependencia')
    plt.xticks(rotation=45)
    
    # Gráfico 3: Distribución de fechas de creación
    if 'createdAt' in datos.columns:
        plt.subplot(2, 2, 3)
        datos['fecha_creacion'] = pd.to_datetime(datos['createdAt']).dt.date
        datos_fecha = datos.groupby(['fecha_creacion', 'anomalia']).size().unstack(fill_value=0)
        datos_fecha.plot(kind='bar', stacked=True, color=['blue', 'red'], ax=plt.gca())
        plt.title('Usuarios por Fecha de Creación')
        plt.xticks(rotation=45)
    
    # Ajustar el layout y guardar
    plt.tight_layout()
    ruta_grafico = os.path.join(directorio_reportes, 
                               f"grafico_usuarios_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
    plt.savefig(ruta_grafico)
    plt.close()
    
    return ruta_informe

def main():
    try:
        # 1. Conectar a la base de datos
        conexion = conectar_bd()
        print("✅ Conectado a la base de datos")
        
        # 2. Consulta para obtener datos de usuarios
        print("📊 Obteniendo datos de usuarios...")
        consulta = """
        SELECT 
            id,
            createdAt,
            rol,
            dependencia,
            esAfiliado,
            activo,
            DATEDIFF(NOW(), createdAt) as dias_desde_registro
        FROM usuarios
        ORDER BY createdAt DESC
        LIMIT 1000
        """
        
        datos = obtener_datos(conexion, consulta)
        
        if datos.empty:
            print("⚠️ No se encontraron datos de usuarios")
            return
            
        print(f"📊 Se encontraron {len(datos)} registros de usuarios")
        
        # 3. Detección de anomalías
        print("🔍 Buscando anomalías...")
        columnas_analisis = ['dias_desde_registro']
        if 'esAfiliado' in datos.columns:
            columnas_analisis.append('esAfiliado')
        
        datos = detectar_anomalias(datos, columnas_numericas=columnas_analisis)
        
        # 4. Generar informe
        print("📝 Generando informe...")
        ruta_informe = generar_reporte_usuarios(datos)
        print(f"✅ Informe generado en: {ruta_informe}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if 'conexion' in locals() and conexion.is_connected():
            conexion.close()
            print("🔌 Conexión cerrada")

if __name__ == "__main__":
    main()