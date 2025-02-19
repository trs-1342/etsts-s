# print_receipt.py

import sys
import json
import sqlite3
import win32print
import win32api


def get_record_by_fishno(db_path, fish_no):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    query = "SELECT product_code, product_name, price FROM records WHERE fishNo = ?"
    cursor.execute(query, (fish_no,))
    row = cursor.fetchone()

    conn.close()
    return row


def print_to_argox(printer_name, raw_data):
    hPrinter = win32print.OpenPrinter(printer_name)
    try:
        job = win32print.StartDocPrinter(
            hPrinter, 1, ("Etiket Yazdırma İşi", None, "RAW")
        )
        try:
            win32print.StartPagePrinter(hPrinter)
            win32print.WritePrinter(hPrinter, raw_data.encode("ascii"))
            win32print.EndPagePrinter(hPrinter)
        finally:
            win32print.EndDocPrinter(hPrinter)
    finally:
        win32print.ClosePrinter(hPrinter)


def main():
    # Argüman kontrolü
    if len(sys.argv) < 2:
        print("Hata: Gerekli argüman yok.")
        return

    # 1) JSON verisini parametreden oku
    try:
        receipt_data = json.loads(sys.argv[1])
    except json.JSONDecodeError as e:
        print(f"Hata: JSON formatı hatalı! - {e}")
        return

    # 2) Gerekli alanları al
    fish_no = receipt_data.get("fishNo")
    if not fish_no:
        print("Hata: 'fishNo' değeri gelmedi.")
        return

    # 3) Veritabanından kayıt çek
    db_path = "database.db"  # Kendi DB dosya yolunuz
    record = get_record_by_fishno(db_path, fish_no)
    if not record:
        print("Bu fiş numarasıyla eşleşen ürün kaydı bulunamadı.")
        return

    product_code, product_name, price = record

    # 4) Argox komut setini hazırla
    argox_printer_name = "Argox OS-214 plus"  # Windows'ta kurulu yazıcı isminiz
    raw_data = f"""
^Q100,3
^W100
^H10
^P1
~Q+0
^S2
^R0
~R200

AAA
D11
1221000010
{product_code}
{product_name}
{price}
E
"""

    # 5) Yazdırma
    try:
        print_to_argox(argox_printer_name, raw_data)
        print(
            "Etiket yazdırma işlemi tamamlandı!"
        )  # stdout'a basıyoruz (Node yakalayacak)
    except Exception as e:
        print(f"Yazdırma hatası: {e}")


if __name__ == "__main__":
    main()
