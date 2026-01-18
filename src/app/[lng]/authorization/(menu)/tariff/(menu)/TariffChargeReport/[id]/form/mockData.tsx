
// หาว่าใน mock_main มี tariff_invoice_sent.id == 1 หรือเปล่า
// ถ้ามี เก็บ shipper.name และ month_year_charge ลง state

export const mock_main = [
    {
        "id": 82,
        "tariff_id": "20250902-TAR-0015-B(16:56:53)",
        "shipper_id": 82,
        "month_year_charge": "2025-08-31T17:00:00.000Z",
        "tariff_type_id": 1,
        "tariff_invoice_sent_id": 1,
        "tariff_type_ab_id": 2,
        "create_date": "2025-09-02T09:56:53.391Z",
        "update_date": "2025-09-02T12:19:33.226Z",
        "create_date_num": 1756807013,
        "update_date_num": 1756815573,
        "create_by": 71,
        "update_by": 71,
        "shipper": {
            "id": 82,
            "name": "PTT-A",
            "id_name": "NGP-S01-001"
        },
        "tariff_invoice_sent": {
            "id": 1,
            "name": "YES",
            "color": "#B5FFCE"
        },
    },
    {
        "id": 81,
        "tariff_id": "20250902-TAR-0015-A(16:56:53)",
        "shipper_id": 82,
        "month_year_charge": "2025-08-31T17:00:00.000Z",
        "tariff_type_id": 1,
        "tariff_invoice_sent_id": 2,
        "tariff_type_ab_id": 1,
        "create_date": "2025-09-02T09:56:53.391Z",
        "update_date": "2025-09-02T11:03:23.017Z",
        "create_date_num": 1756807013,
        "update_date_num": 1756811003,
        "create_by": 71,
        "update_by": 71,
        "shipper": {
            "id": 82,
            "name": "PTT-A",
            "id_name": "NGP-S01-001"
        },
        "tariff_invoice_sent": {
            "id": 2,
            "name": "NO",
            "color": "#FFDEDE"
        },
    },
    {
        "id": 80,
        "tariff_id": "20250902-TAR-0013-B(16:45:52)",
        "shipper_id": 82,
        "month_year_charge": "2025-08-31T17:00:00.000Z",
        "tariff_type_id": 1,
        "tariff_invoice_sent_id": 2,
        "tariff_type_ab_id": 2,
        "create_date": "2025-09-02T09:45:52.088Z",
        "update_date": null,
        "create_date_num": 1756806352,
        "update_date_num": null,
        "create_by": 71,
        "update_by": null,
        "shipper": {
            "id": 82,
            "name": "PTT-A",
            "id_name": "NGP-S01-001"
        },
        "tariff_invoice_sent": {
            "id": 2,
            "name": "NO",
            "color": "#FFDEDE"
        },
    },
]