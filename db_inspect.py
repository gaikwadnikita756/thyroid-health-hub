import sqlite3

conn = sqlite3.connect('prisma/dev.db')
cur = conn.cursor()
for table, cols in [('patients', 'id, userId'), ('medical_tests', 'id, patientId, fileName, filePath'), ('users', 'id, email')]:
    print(f'--- {table} ---')
    try:
        rows = cur.execute(f'SELECT {cols} FROM {table} LIMIT 5').fetchall()
        for row in rows:
            print(row)
    except Exception as e:
        print('ERROR:', e)

conn.close()
