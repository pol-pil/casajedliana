<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<title>Statement of Account</title>

		<style>
			@page {
				margin: 0;
			}

			body {
				font-family:
					Helvetica,
					sans-serif;
				font-size: 12px;
				color: #000;
			}

			.container {
				width: 100%;
				border: 1px solid #ccc;
			}

			.details-container {
				padding: 20px 30px;
				background-image: url("{{ public_path('/soabg.png') }}");
				background-repeat: no-repeat;
				background-position: center center;
				background-size: cover; /* fills the entire page */
				background-attachment: fixed;
			}

			/* HEADER */
			.header {
				background-image: url("{{ public_path('bggradient.png') }}");
				background-size: cover;
				background-repeat: no-repeat;
				color: #fff;
				padding: 11px 16px;
			}

			.header table {
				width: 100%;
			}

			.title {
				text-align: center;
				font-size: 17px;
				font-weight: bold;
				letter-spacing: 14px;
				border-top: 2px solid #000;
				border-bottom: 2px solid #000;
				padding: 5px 0;
				margin: 0 0 10px 0;
			}

			/* INFO */
			.info {
				width: 100%;
				margin-bottom: 10px;
			}

			.info td {
				vertical-align: top;
				padding: 5px;
			}

			/* MAIN TABLE */
			.soa-table {
				width: 100%;
				border-collapse: separate; /* change from collapse to separate */
				border-spacing: 0; /* remove gaps between cells */
				border-radius: 10px; /* adjust as needed */
				table-layout: fixed; /* ensures equal column widths */
				overflow: hidden;
				margin-top: 10px;
				margin-top: 10px;
				background-color: #f9f7eb;
				border: 1px solid #787878;
				font-size: 10px;
			}

			.soa-table th,
			.soa-table td {
				padding: 6px;
				border-right: 1px solid #787878;  /* only right border */
				border-bottom: 1px solid #787878;
			}

			.soa-table th {
				background: #ffffff10;
			}

			.total-row td {
				font-weight: bold;
				background: #ffffff10;
				border-bottom: 0;
			}

			/* SIGNATURE */
			.signature {
				width: 80%;
				margin-top: 15px;
			}

			.signature td {
				width: 50%;
				vertical-align: top;
			}

			.line {
				border-top: 1px solid #000;
				width: 80%;
			}

			.by {
				margin-top: 16px;
				margin-right: 70px;
				text-align: center;
			}

			.negative {
				color: #828282;
			}

			.sig {
				margin-right: 70px;
				text-align: center;
				color: #3b3b3b;
			}

			.watermark {
				position: fixed;
				top: 45.5%;
				right: 28px;
				width: 60px;
			}

			.icontext {
				margin: 4px 0;
				line-height: 16px;
				font-size: 12px;
			}

			.icontext img {
				vertical-align: middle;
				margin: 10px 6px 0 0;
			}

			.icontext span {
				vertical-align: middle;
			}
			
		</style>
	</head>

	<body>
		<div class="container">
			<!-- HEADER -->
			<div class="header">
				<table>
				<tr>
					<td><img src="{{ public_path('casatitle.png') }}" style="height: 60px;" /><br /></td>
					<td align="right">
						<div style="display: inline-block; text-align: left;">
							<p class="icontext">
								<img src="{{ public_path('locationIcon.png') }}" style="height: 16px;" />
								Purok 1, Barangay Tagpos, Santa Rosa, Nueva Ecija
							</p>
							<p class="icontext">
								<img src="{{ public_path('pageIcon.png') }}" style="height: 16px;" />
								Casa Jedliana Hotel and Resort
							</p>
						</div>
					</td>
				</tr>
				</table>
			</div>

			<!-- TITLE -->
			<div class="details-container">
				<div class="title">STATEMENT OF ACCOUNT</div>

				<!-- INFO -->
				<table class="info">
					<tr>
						<td>
							<strong>Billed to:</strong> {{ $booking->client->first_name }} {{ $booking->client->last_name }}<br />
							<strong>Address:</strong> {{ $booking->client->address }}<br />
							<strong>Check In Date:</strong> {{ \Carbon\Carbon::parse($booking->check_in)->format('F d, Y') }}<br />
							<strong>Check Out Date:</strong> {{ \Carbon\Carbon::parse($booking->check_out)->format('F d, Y') }}
						</td>

						<td align="right">
							<strong>Transaction Ref No.:</strong> {{ $booking->id }}<br />
							<strong>Reservation No.:</strong> RES-{{ $booking->id }}
						</td>
					</tr>
				</table>

				<!-- DETAILS TABLE -->
				<table class="soa-table">
					<tr>
						<th>Description</th>
						<th>Value</th>
						<th>Description</th>
						<th>Value</th>
					</tr>

					<tr>
						<td>Room No.</td>
						<td>{{ $booking->room->room_number }}</td>
						<td>Room Rate</td>
						<td><span style="font-family: DejaVu Sans">₱</span> {{ number_format($booking->room->price, 2) }}</td>
					</tr>

					@php $nights = \Carbon\Carbon::parse($booking->check_in)->diffInDays(\Carbon\Carbon::parse($booking->check_out));
					@endphp

					<tr>
						<td>Room Type</td>
						<td>{{ $booking->room->room_type }}</td>
						<td>No. of Nights</td>
						<td>{{ number_format($nights, 0) }}</td>
					</tr>

					@php $total = $booking->room->price * round($nights, 0); @endphp
					@php $discountAmount = $total * ($booking->rate->value
					/ 100); @endphp

					<tr>
						<td>Booking Type</td>
						<td>{{ $booking->bookingType->name }}</td>
						<td>Total</td>
						<td><span style="font-family: DejaVu Sans">₱</span> {{ number_format($total, 2) }}</td>
					</tr>

					@php $addons = $booking->bookingCharges->sum('total'); @endphp

					<tr>
						<td>No. of Guests</td>
						<td>{{ $booking->guest_count }}</td>
						<td>Additional Charges</td>
						<td><span style="font-family: DejaVu Sans">₱</span> {{ number_format($addons, 2) }}</td>
					</tr>

					<tr>
						<td>Discount Type</td>
						<td>{{ $booking->rate->name }}</td>
						<td>Discount</td>
						<td><span style="font-family: DejaVu Sans">₱</span> <span class="negative">-</span>{{ number_format($discountAmount, 2) }}</td>
					</tr>

					@php $grandTotal = $booking->total_amount + $addons + ($booking->damage_fee ?? 0); $amountPaid =
					$booking->payments->sum('amount'); $balance = $grandTotal - $amountPaid; @endphp

					<tr>
						<td>Purpose of Stay</td>
						<td>{{ $booking->purpose }}</td>
						<td>GRAND TOTAL</td>
						<td><span style="font-family: DejaVu Sans">₱</span> {{ number_format($grandTotal, 2) }}</td>
					</tr>

					<tr>
						<td colspan="2">Amount Paid</td>
						<td colspan="2"><span style="font-family: DejaVu Sans">₱</span> <span class="negative">-</span>{{ number_format($amountPaid, 2) }}</td>
					</tr>

					<tr class="total-row">
						<td colspan="2">OUTSTANDING BALANCE</td>
						<td colspan="2"><span style="font-family: DejaVu Sans">₱</span> {{ number_format($balance, 2) }}</td>
					</tr>
				</table>

				<!-- SIGNATURE -->
				<table class="signature">
					<tr>
						<td>
							Prepared by:
							<div class="by">{{ Auth::user()->name }}</div>
							<div class="line"></div>
							<div class="sig">Signature over printed name</div>
						</td>

						<td>
							Customer's Name:
							<div class="by">{{ $booking->client->first_name }} {{ $booking->client->last_name }}</div>
							<div class="line"></div>
							<div class="sig">Signature over printed name</div>
						</td>
					</tr>
				</table>
			</div>
		</div>

		<img class="watermark" src="{{ public_path('watermark.png') }}" />
	</body>
</html>
