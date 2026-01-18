export const mock_tariff_type = [
    {
        "id": 1,
        "name": "System",
        "color": null
    },
    {
        "id": 2,
        "name": "Manual",
        "color": null
    }
]



export const mock_tariff_charge_type = [
    {
        "id": 1,
        "name": "Capacity Charge",
        "color": null
    },
    {
        "id": 2,
        "name": "Commodity Charge",
        "color": null
    },
    {
        "id": 3,
        "name": "Imbalances Penalty Charge (Positive)",
        "color": null
    },
    {
        "id": 4,
        "name": "Imbalances Penalty Charge (Negative)",
        "color": null
    },
    {
        "id": 5,
        "name": "Capacity Overuse Charge (Entry)",
        "color": null
    },
    {
        "id": 6,
        "name": "Capacity Overuse Charge (Exit)",
        "color": null
    },
    {
        "id": 7,
        "name": "Damage Charge",
        "color": null
    }
]





export const mock_main_table = {
    "total": 4,
    "data": [
        {
            "id": 10,
            "tariff_id": "20250818-TAR-0003-B(16:43:25)",
            "shipper_id": 62,
            "month_year_charge": "2025-07-31T17:00:00.000Z",
            "tariff_type_id": 1,
            "tariff_invoice_sent_id": 2,
            "tariff_type_ab_id": 2,
            "create_date": "2025-08-18T09:43:25.160Z",
            "update_date": null,
            "create_date_num": 1755510205,
            "update_date_num": null,
            "create_by": 99988,
            "update_by": null,
            "shipper": {
                "id": 62,
                "name": "EGAT",
                "id_name": "EGAT-001-1"
            },
            "tariff_type": {
                "id": 1,
                "name": "System",
                "color": null
            },
            "tariff_comment": [],
            "tariff_invoice_sent": {
                "id": 2,
                "name": "NO",
                "color": "#FFDEDE"
            },
            "tariff_type_ab": {
                "id": 2,
                "name": "B",
                "color": null
            },
            "create_by_account": {
                "id": 99988,
                "email": "komtso@gmail.com",
                "first_name": "DevK",
                "last_name": "TSO"
            },
            "update_by_account": null
        },
        {
            "id": 9,
            "tariff_id": "20250818-TAR-0003-A(16:43:25)",
            "shipper_id": 62,
            "month_year_charge": "2025-07-31T17:00:00.000Z",
            "tariff_type_id": 1,
            "tariff_invoice_sent_id": 2,
            "tariff_type_ab_id": 1,
            "create_date": "2025-08-18T09:43:25.160Z",
            "update_date": null,
            "create_date_num": 1755510205,
            "update_date_num": null,
            "create_by": 99988,
            "update_by": null,
            "shipper": {
                "id": 62,
                "name": "EGAT",
                "id_name": "EGAT-001-1"
            },
            "tariff_type": {
                "id": 1,
                "name": "System",
                "color": null
            },
            "tariff_comment": [],
            "tariff_invoice_sent": {
                "id": 2,
                "name": "NO",
                "color": "#FFDEDE"
            },
            "tariff_type_ab": {
                "id": 1,
                "name": "A",
                "color": null
            },
            "create_by_account": {
                "id": 99988,
                "email": "komtso@gmail.com",
                "first_name": "DevK",
                "last_name": "TSO"
            },
            "update_by_account": null
        },
        {
            "id": 8,
            "tariff_id": "20250818-TAR-0001-B(16:10:25)",
            "shipper_id": 62,
            "month_year_charge": "2025-07-31T17:00:00.000Z",
            "tariff_type_id": 1,
            "tariff_invoice_sent_id": 2,
            "tariff_type_ab_id": 2,
            "create_date": "2025-08-18T09:10:25.269Z",
            "update_date": null,
            "create_date_num": 1755508225,
            "update_date_num": null,
            "create_by": 99988,
            "update_by": null,
            "shipper": {
                "id": 62,
                "name": "EGAT",
                "id_name": "EGAT-001-1"
            },
            "tariff_type": {
                "id": 1,
                "name": "System",
                "color": null
            },
            "tariff_comment": [],
            "tariff_invoice_sent": {
                "id": 2,
                "name": "NO",
                "color": "#FFDEDE"
            },
            "tariff_type_ab": {
                "id": 2,
                "name": "B",
                "color": null
            },
            "create_by_account": {
                "id": 99988,
                "email": "komtso@gmail.com",
                "first_name": "DevK",
                "last_name": "TSO"
            },
            "update_by_account": null
        },
        {
            "id": 7,
            "tariff_id": "20250818-TAR-0001-A(16:10:25)",
            "shipper_id": 62,
            "month_year_charge": "2025-07-31T17:00:00.000Z",
            "tariff_type_id": 1,
            "tariff_invoice_sent_id": 2,
            "tariff_type_ab_id": 1,
            "create_date": "2025-08-18T09:10:25.269Z",
            "update_date": null,
            "create_date_num": 1755508225,
            "update_date_num": null,
            "create_by": 99988,
            "update_by": null,
            "shipper": {
                "id": 62,
                "name": "EGAT",
                "id_name": "EGAT-001-1"
            },
            "tariff_type": {
                "id": 1,
                "name": "System",
                "color": null
            },
            "tariff_comment": [
                {
                    "id": 2,
                    "comment": "ok.",
                    "tariff_id": 7,
                    "create_date": "2025-08-18T09:10:39.660Z",
                    "update_date": null,
                    "create_date_num": 1755508239,
                    "update_date_num": null,
                    "create_by": 99988,
                    "update_by": null,
                    "create_by_account": {
                        "id": 99988,
                        "email": "komtso@gmail.com",
                        "first_name": "DevK",
                        "last_name": "TSO"
                    },
                    "update_by_account": null
                }
            ],
            "tariff_invoice_sent": {
                "id": 2,
                "name": "NO",
                "color": "#FFDEDE"
            },
            "tariff_type_ab": {
                "id": 1,
                "name": "A",
                "color": null
            },
            "create_by_account": {
                "id": 99988,
                "email": "komtso@gmail.com",
                "first_name": "DevK",
                "last_name": "TSO"
            },
            "update_by_account": null
        }
    ]
}